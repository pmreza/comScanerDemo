using System.Diagnostics;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Text.Json.Nodes;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Mvc;

// =========================================================================
// Multi-Agent Factory OCR & Auditing System - ASP.NET Core Minimal Web API
// =========================================================================

var builder = WebApplication.CreateBuilder(args);
builder.Configuration.AddJsonFile("appsettings.local.json", optional: true, reloadOnChange: true);

// 1. CONFIGURE GEMINI API KEY:
// Set your API key in appsettings.local.json (ignored by git), appsettings.json "Gemini:ApiKey",
// OR environment variable "GEMINI_API_KEY", OR via X-Gemini-Key header from frontend.
const string DefaultGeminiApiKey = "";

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

builder.Services.AddHttpClient("GeminiClient", client =>
{
    client.Timeout = TimeSpan.FromSeconds(180);
});

builder.Services.Configure<Microsoft.AspNetCore.Http.Features.FormOptions>(options =>
{
    options.MultipartBodyLengthLimit = 50 * 1024 * 1024; // 50MB
});

builder.Services.AddAntiforgery();

var app = builder.Build();

app.UseCors("AllowAll");
app.UseAntiforgery();

// -------------------------------------------------------------
// Helper Methods & Gemini Client Service
// -------------------------------------------------------------
string ResolveApiKey(HttpContext context, IConfiguration config)
{
    // 1. Header from client UI
    if (context.Request.Headers.TryGetValue("X-Gemini-Key", out var headerKey) && !string.IsNullOrWhiteSpace(headerKey))
    {
        return headerKey.ToString().Trim();
    }
    // 2. Query string parameter
    if (context.Request.Query.TryGetValue("apiKey", out var queryKey) && !string.IsNullOrWhiteSpace(queryKey))
    {
        return queryKey.ToString().Trim();
    }
    // 3. Environment Variable
    var envKey = Environment.GetEnvironmentVariable("GEMINI_API_KEY");
    if (!string.IsNullOrWhiteSpace(envKey))
    {
        return envKey.Trim();
    }
    // 4. appsettings.json
    var configKey = config["Gemini:ApiKey"];
    if (!string.IsNullOrWhiteSpace(configKey))
    {
        return configKey.Trim();
    }
    // 5. Code constant
    return DefaultGeminiApiKey;
}

// -------------------------------------------------------------
// Health Check Endpoint
// -------------------------------------------------------------
app.MapGet("/api/health", (HttpContext context, IConfiguration config) =>
{
    var key = ResolveApiKey(context, config);
    return Results.Ok(new
    {
        status = "Healthy",
        hasApiKeyConfigured = !string.IsNullOrWhiteSpace(key),
        timestamp = DateTime.UtcNow,
        supportedModels = new[] { "gemini-1.5-flash", "gemini-2.0-flash", "gemini-1.5-pro" }
    });
});

// -------------------------------------------------------------
// Sample Scanned Reports Endpoint
// -------------------------------------------------------------
app.MapGet("/api/samples", () =>
{
    var imgDir = Path.Combine(Directory.GetCurrentDirectory(), "..", "imgas");
    if (!Directory.Exists(imgDir))
    {
        imgDir = Path.Combine(Directory.GetCurrentDirectory(), "samples");
    }

    if (!Directory.Exists(imgDir))
    {
        return Results.Ok(Array.Empty<object>());
    }

    var files = Directory.GetFiles(imgDir)
        .Where(f => f.EndsWith(".jpg", StringComparison.OrdinalIgnoreCase) ||
                    f.EndsWith(".png", StringComparison.OrdinalIgnoreCase) ||
                    f.EndsWith(".webp", StringComparison.OrdinalIgnoreCase))
        .Select(f => new
        {
            fileName = Path.GetFileName(f),
            sizeBytes = new FileInfo(f).Length,
            title = Path.GetFileNameWithoutExtension(f)
                .Replace("_", " ")
                .Replace("image", "برگه نمونه")
        })
        .ToList();

    return Results.Ok(files);
});

app.MapGet("/api/samples/{fileName}", (string fileName) =>
{
    var safeName = Path.GetFileName(fileName);
    var imgDir = Path.Combine(Directory.GetCurrentDirectory(), "..", "imgas");
    var filePath = Path.Combine(imgDir, safeName);
    if (!File.Exists(filePath))
    {
        return Results.NotFound();
    }

    var ext = Path.GetExtension(filePath).ToLowerInvariant();
    var contentType = ext switch
    {
        ".png" => "image/png",
        ".webp" => "image/webp",
        _ => "image/jpeg"
    };

    return Results.File(filePath, contentType);
});

// -------------------------------------------------------------
// Main Multi-Agent Pipeline Endpoint
// -------------------------------------------------------------
app.MapPost("/api/analyze-report", async (
    [FromForm] IFormFile? image,
    HttpContext context,
    IConfiguration config,
    IHttpClientFactory httpClientFactory) =>
{
    var stopwatch = Stopwatch.StartNew();
    var apiKey = ResolveApiKey(context, config);
    var isDemoRequested = context.Request.Query.ContainsKey("demo") || string.IsNullOrWhiteSpace(apiKey);

    // If Demo is requested or no API key is provided, return high-fidelity simulated multi-agent response
    if (isDemoRequested)
    {
        var sampleName = image?.FileName ?? "image_04_hourly_production_report.jpg";
        var demoResponse = GenerateRealisticDemoResponse(sampleName);
        demoResponse["processingTimeMs"] = 1845;
        demoResponse["isDemoMode"] = true;
        if (string.IsNullOrWhiteSpace(apiKey))
        {
            demoResponse["notice"] = "کلید API جمینای وارد نشده بود؛ داده‌های نمونه داوری چند ایجنتی به صورت پیش‌فرض بارگذاری شد.";
        }
        return Results.Ok(demoResponse);
    }

    if (image == null || image.Length == 0)
    {
        return Results.BadRequest(new { error = "لطفاً تصویر گزارش دست‌نویس را آپلود کنید (No image uploaded)." });
    }

    // Read Image to Base64
    using var ms = new MemoryStream();
    await image.CopyToAsync(ms);
    var imageBytes = ms.ToArray();
    var base64Image = Convert.ToBase64String(imageBytes);
    var mimeType = image.ContentType;
    if (string.IsNullOrWhiteSpace(mimeType) || mimeType == "application/octet-stream")
    {
        var ext = Path.GetExtension(image.FileName).ToLowerInvariant();
        mimeType = ext switch
        {
            ".png" => "image/png",
            ".webp" => "image/webp",
            _ => "image/jpeg"
        };
    }

    var httpClient = httpClientFactory.CreateClient("GeminiClient");

    try
    {
        // ---------------------------------------------------------------------
        // Step 1: Run Agent A and Agent B IN PARALLEL (Task.WhenAll)
        // ---------------------------------------------------------------------
        var taskAgentA = RunAgentAExtractor(httpClient, apiKey, base64Image, mimeType);
        var taskAgentB = RunAgentBExtractor(httpClient, apiKey, base64Image, mimeType);

        await Task.WhenAll(taskAgentA, taskAgentB);

        var agentAResult = await taskAgentA;
        var agentBResult = await taskAgentB;

        // ---------------------------------------------------------------------
        // Step 2: Run Agent C (Judge AI / سرحسابرس هوشمند)
        // ---------------------------------------------------------------------
        var judgeResult = await RunAgentCJudge(httpClient, apiKey, base64Image, mimeType, agentAResult, agentBResult);

        stopwatch.Stop();

        return Results.Ok(new
        {
            agentA = agentAResult,
            agentB = agentBResult,
            judge = judgeResult,
            processingTimeMs = stopwatch.ElapsedMilliseconds,
            isDemoMode = false
        });
    }
    catch (Exception ex)
    {
        // Fallback gracefully if rate limit (429) or model issue occurs during client demo
        var fallback = GenerateRealisticDemoResponse(image.FileName);
        fallback["processingTimeMs"] = stopwatch.ElapsedMilliseconds;
        fallback["isDemoMode"] = true;
        fallback["apiError"] = ex.Message;
        fallback["notice"] = $"خطا در اتصال به جمینای ({ex.Message}). جهت جلوگیری از اختلال در دمو، داده‌های داوری شبیه‌سازی شده نمایش داده شد.";
        return Results.Ok(fallback);
    }
}).DisableAntiforgery();

app.Run();

// -------------------------------------------------------------
// Agent Implementation Methods
// -------------------------------------------------------------

static async Task<JsonNode?> RunAgentAExtractor(HttpClient client, string apiKey, string base64Image, string mimeType)
{
    var systemPrompt = @"شما ایجنت استخراج اولیه داده‌های دست‌نویس کارخانه (Agent A - Extractor 1) هستید.
وظیفه شما بازخوانی دقیق، مستقیم و کاراکتر به کاراکتر فرم، جدول و ارقام دست‌نویس فارسی است.
قوانین اکید:
۱. ارقام دست‌نویس فارسی را به اعداد انگلیسی تبدیل کن و در فیلدهای عددی قرار بده.
۲. هیچ عددی را با حساب و کتاب خودت تصحیح نکن؛ دقیقا آنچه با دست‌خط انسانی روی برگه ثبت شده را بخوان حتی اگر خطای جمع یا کسر داشته باشد.
۳. اگر روی سطری خط‌خوردگی، تصحیح با خودکار یا قلم‌گرفتگی دیدی، مقدار نهایی اصلاح‌شده را بنویس و فیلد 'hasHandwritingStrike' را true قرار بده.
۴. خروجی باید فقط و فقط یک آبجکت معتبر JSON طبق ساختار خواسته شده باشد بدون هیچ پیش‌گفتار، پس‌گفتار یا مارک‌داون اضافی.";

    var userPrompt = @"لطفاً گزارش تولید دست‌نویس را بخوان و در این فرمت دقیق JSON خروجی بده:
{
  ""reportDate"": ""تاریخ برگه (مثلا ۱۴۰۳/۰۷/۱۵)"",
  ""factoryName"": ""نام کارخانه یا واحد تولیدی"",
  ""shiftSupervisor"": ""نام سرپرست شیفت یا مسئول تکمیل"",
  ""items"": [
    {
      ""rowNumber"": 1,
      ""productName"": ""نام قطعه یا محصول"",
      ""rawMaterialUsed"": 100,
      ""totalProduced"": 100,
      ""wasteCount"": 5,
      ""netProduced"": 95,
      ""hasHandwritingStrike"": false
    }
  ],
  ""summary"": {
    ""totalProductionSum"": 0,
    ""totalWasteSum"": 0,
    ""totalNetSum"": 0
  }
}";

    // Agent A uses gemini-3.8-flash (T=0.1) with fallback to gemini-3.1-flash-lite
    try
    {
        return await CallGeminiJson(client, apiKey, "gemini-3.8-flash", 0.1, base64Image, mimeType, systemPrompt, userPrompt);
    }
    catch
    {
        return await CallGeminiJson(client, apiKey, "gemini-3.1-flash-lite", 0.1, base64Image, mimeType, systemPrompt, userPrompt);
    }
}

static async Task<JsonNode?> RunAgentBExtractor(HttpClient client, string apiKey, string base64Image, string mimeType)
{
    var systemPrompt = @"شما یک بازرس و حسابرس مستقل کنترل کیفیت و تولید هستید (Agent B - Extractor 2 - Independent Auditor).
دیدگاه شما مستقل از هر ایجنت دیگری است و باید برگه دست‌نویس را با تمرکز بر تمایز ارقام چالش‌برانگیز فارسی (مانند تمایز ۲ و ۳، ۰ و ۵، ۷ و ۸) بازخوانی کنید.
قوانین:
۱. داده‌های جدول، ستون مواد اولیه، تولید کل، ضایعات و خالص را مستقیماً از دست‌خط بخوانید.
۲. نسبت به خط‌خوردگی‌ها و ارقام رونویسی شده یا خط‌خورده حساس باشید؛ اگر ردیفی دستکاری شده 'hasHandwritingStrike' را true کنید.
۳. فقط آنچه روی کاغذ آمده را استخراج کنید و محاسبات اشتباه نویسنده را تغییر ندهید.
۴. خروجی فقط JSON معتبر باشد.";

    var userPrompt = @"اطلاعات برگه دست‌نویس صنعتی را به این ساختار استخراج کنید:
{
  ""reportDate"": ""تاریخ"",
  ""factoryName"": ""واحد / کارخانه"",
  ""shiftSupervisor"": ""سرپرست شیفت"",
  ""items"": [
    {
      ""rowNumber"": 1,
      ""productName"": ""نام محصول"",
      ""rawMaterialUsed"": 0,
      ""totalProduced"": 0,
      ""wasteCount"": 0,
      ""netProduced"": 0,
      ""hasHandwritingStrike"": false
    }
  ],
  ""summary"": {
    ""totalProductionSum"": 0,
    ""totalWasteSum"": 0,
    ""totalNetSum"": 0
  }
}";

    // Agent B uses gemini-3.8-flash (T=0.4, independent auditor) with fallback to gemini-3.1-flash-lite
    try
    {
        return await CallGeminiJson(client, apiKey, "gemini-3.8-flash", 0.4, base64Image, mimeType, systemPrompt, userPrompt);
    }
    catch
    {
        return await CallGeminiJson(client, apiKey, "gemini-3.1-flash-lite", 0.4, base64Image, mimeType, systemPrompt, userPrompt);
    }
}

static async Task<JsonNode?> RunAgentCJudge(
    HttpClient client,
    string apiKey,
    string base64Image,
    string mimeType,
    JsonNode? agentA,
    JsonNode? agentB)
{
    var systemPrompt = @"شما رئیس هیئت داوری و سرحسابرس هوشمند سیستم ممیزی کارخانه‌ای هستید (Agent C - Judge AI).
وظیفه شما:
۱. مقایسه خروجی دو استخراج‌کننده موازی (Agent A و Agent B):
   - هر اختلافی بین این دو پیدا کردی، با نگاه مجدد و دقیق به تصویر دست‌نویس آن را داوری و حل کن.
   - دلیل داوری را به زبان فارسی روان در آرایه differencesFound بنویس (مثلاً ذکر کن آیا دست‌خط به دلیل شباهت اعداد ۲ و ۳ یا خط‌خوردگی اشتباه خوانده شده بوده است).
۲. ممیزی و حسابرسی ریاضی خطاهای انسانی روی کاغذ (Math Audit):
   - برای هر سطر بررسی کن: آیا (totalProduced - wasteCount == netProduced) برقرار است؟
   - بررسی کن آیا جمع کل ستون‌های summary با مجموع ستون‌های items همخوانی دارد؟
   - اگر نویسنده روی کاغذ جمع یا تفریق را اشتباه نوشته است، آن را با ذکر شماره سطر، مقدار غلط نوشته شده روی کاغذ (paperValue)، مقدار صحیح ریاضی (correctMathValue) و توضیحات کامل در آرایه mathErrorsOnPaper گزارش کن.
۳. تولید داده نهایی پاکسازی و تایید شده (finalVerifiedData).
۴. تعیین نمره اطمینان سیستم (confidenceScore بین ۰ تا ۱۰۰).";

    var jsonA = agentA?.ToJsonString() ?? "{}";
    var jsonB = agentB?.ToJsonString() ?? "{}";

    var userPrompt = $@"این نتایج استخراج ایجنت‌های موازی است:

[خروجی Agent A]:
{jsonA}

[خروجی Agent B]:
{jsonB}

اکنون با توجه به تصویر اصلی، لطفاً داوری نهایی، اصلاح اختلافات و بررسی خطاهای ریاضی را انجام داده و این ساختار JSON دقیق را برگردان:
{{
  ""finalVerifiedData"": {{
    ""reportDate"": ""تاریخ تایید شده"",
    ""factoryName"": ""نام کارخانه"",
    ""shiftSupervisor"": ""نام سرپرست"",
    ""items"": [
      {{
        ""rowNumber"": 1,
        ""productName"": ""نام محصول"",
        ""rawMaterialUsed"": 0,
        ""totalProduced"": 0,
        ""wasteCount"": 0,
        ""netProduced"": 0,
        ""hasHandwritingStrike"": false
      }}
    ],
    ""summary"": {{
      ""totalProductionSum"": 0,
      ""totalWasteSum"": 0,
      ""totalNetSum"": 0
    }}
  }},
  ""differencesFound"": [
    {{
      ""field"": ""ردیف یا فیلد مورد اختلاف (مثلا: ردیف ۲ - ضایعات)"",
      ""agentAValue"": ""مقدار خوانده شده توسط ایجنت A"",
      ""agentBValue"": ""مقدار خوانده شده توسط ایجنت B"",
      ""judgeDecision"": ""تصمیم نهایی داور هوشمند"",
      ""reason"": ""دلیل تفصیلی داوری به زبان فارسی بر اساس خط‌خوردگی یا بافت دست‌خط""
    }}
  ],
  ""mathErrorsOnPaper"": [
    {{
      ""rowNumber"": 1,
      ""paperValue"": ""مقدار غلط درج شده روی کاغذ"",
      ""correctMathValue"": ""مقدار صحیح ریاضی"",
      ""description"": ""توضیح فارسی خطای انسانی (مثلا: در ردیف ۳ تولید کل ۶۰۰ منهای ضایعات ۴۰ باید ۵۶۰ باشد اما اپراتور ۵۷۰ نوشته است)""
    }}
  ],
  ""confidenceScore"": 98.5
}}";

    // Agent C (Judge AI) uses gemini-3.8-flash (T=0.0) with fallback to gemini-3.1-flash-lite
    try
    {
        return await CallGeminiJson(client, apiKey, "gemini-3.8-flash", 0.0, base64Image, mimeType, systemPrompt, userPrompt);
    }
    catch
    {
        return await CallGeminiJson(client, apiKey, "gemini-3.1-flash-lite", 0.0, base64Image, mimeType, systemPrompt, userPrompt);
    }
}

// -------------------------------------------------------------
// Core Gemini API HTTP Request Function
// -------------------------------------------------------------
static async Task<JsonNode?> CallGeminiJson(
    HttpClient client,
    string apiKey,
    string model,
    double temperature,
    string base64Image,
    string mimeType,
    string systemPrompt,
    string userPrompt)
{
    var url = $"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={apiKey}";

    var payload = new
    {
        systemInstruction = new
        {
            parts = new object[]
            {
                new { text = systemPrompt }
            }
        },
        contents = new object[]
        {
            new
            {
                role = "user",
                parts = new object[]
                {
                    new
                    {
                        inlineData = new
                        {
                            mimeType = mimeType,
                            data = base64Image
                        }
                    },
                    new
                    {
                        text = userPrompt
                    }
                }
            }
        },
        generationConfig = new
        {
            temperature = temperature,
            responseMimeType = "application/json"
        }
    };

    var jsonContent = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");
    var response = await client.PostAsync(url, jsonContent);

    if (!response.IsSuccessStatusCode)
    {
        var errorBody = await response.Content.ReadAsStringAsync();
        // If model is 1.5-pro and fails, or flash fails, throw descriptive exception
        throw new HttpRequestException($"Gemini API error ({response.StatusCode}) on model {model}: {errorBody}");
    }

    var responseString = await response.Content.ReadAsStringAsync();
    var geminiDoc = JsonNode.Parse(responseString);
    var textOutput = geminiDoc?["candidates"]?[0]?["content"]?[parts()]?[0]?["text"]?.GetValue<string>()
                     ?? geminiDoc?["candidates"]?[0]?["content"]?["parts"]?[0]?["text"]?.GetValue<string>();

    if (string.IsNullOrWhiteSpace(textOutput))
    {
        throw new InvalidOperationException("Gemini returned an empty candidate content response.");
    }

    // Clean potential markdown wrap if any remains
    var cleanJson = textOutput.Trim();
    if (cleanJson.StartsWith("```json", StringComparison.OrdinalIgnoreCase))
    {
        cleanJson = cleanJson.Substring(7);
    }
    else if (cleanJson.StartsWith("```"))
    {
        cleanJson = cleanJson.Substring(3);
    }
    if (cleanJson.EndsWith("```"))
    {
        cleanJson = cleanJson.Substring(0, cleanJson.Length - 3);
    }
    cleanJson = cleanJson.Trim();

    return JsonNode.Parse(cleanJson);

    static string parts() => "parts";
}

// -------------------------------------------------------------
// High-Fidelity Realistic Demo Data Generator
// -------------------------------------------------------------
static JsonObject GenerateRealisticDemoResponse(string sampleName)
{
    var agentA = new JsonObject
    {
        ["reportDate"] = "۱۴۰۳/۰۷/۱۸",
        ["factoryName"] = "صنایع متالورژی و قطعه‌سازی پیشگام البرز (واحد پرس‌کاری)",
        ["shiftSupervisor"] = "مهندس علیرضا سلیمانی (شیفت صبح)",
        ["items"] = new JsonArray
        {
            new JsonObject
            {
                ["rowNumber"] = 1,
                ["productName"] = "پوسته پمپ هیدرولیک تیپ A-20",
                ["rawMaterialUsed"] = 620,
                ["totalProduced"] = 600,
                ["wasteCount"] = 25,
                ["netProduced"] = 575,
                ["hasHandwritingStrike"] = false
            },
            new JsonObject
            {
                ["rowNumber"] = 2,
                ["productName"] = "شفت گیربکس صنعتی ۶ دنده",
                ["rawMaterialUsed"] = 430,
                ["totalProduced"] = 420,
                ["wasteCount"] = 18, // Agent A read 18
                ["netProduced"] = 402,
                ["hasHandwritingStrike"] = true
            },
            new JsonObject
            {
                ["rowNumber"] = 3,
                ["productName"] = "بوش برنجی خودران دینام 4KW",
                ["rawMaterialUsed"] = 850,
                ["totalProduced"] = 820,
                ["wasteCount"] = 40,
                ["netProduced"] = 790, // Note human math error: 820 - 40 is 780, but paper wrote 790!
                ["hasHandwritingStrike"] = false
            },
            new JsonObject
            {
                ["rowNumber"] = 4,
                ["productName"] = "فلنج رابط چدنی قطر ۱۲۰mm",
                ["rawMaterialUsed"] = 310,
                ["totalProduced"] = 300,
                ["wasteCount"] = 12,
                ["netProduced"] = 288,
                ["hasHandwritingStrike"] = false
            },
            new JsonObject
            {
                ["rowNumber"] = 5,
                ["productName"] = "یاتاقان کاسه‌ای فولادی سری V",
                ["rawMaterialUsed"] = 550,
                ["totalProduced"] = 540,
                ["wasteCount"] = 30,
                ["netProduced"] = 510,
                ["hasHandwritingStrike"] = true
            }
        },
        ["summary"] = new JsonObject
        {
            ["totalProductionSum"] = 2680,
            ["totalWasteSum"] = 125,
            ["totalNetSum"] = 2565
        }
    };

    var agentB = new JsonObject
    {
        ["reportDate"] = "۱۴۰۳/۰۷/۱۸",
        ["factoryName"] = "صنایع متالورژی و قطعه‌سازی پیشگام البرز - خط پرس ۳",
        ["shiftSupervisor"] = "مهندس ع. سلیمانی",
        ["items"] = new JsonArray
        {
            new JsonObject
            {
                ["rowNumber"] = 1,
                ["productName"] = "پوسته پمپ هیدرولیک تیپ A-20",
                ["rawMaterialUsed"] = 620,
                ["totalProduced"] = 600,
                ["wasteCount"] = 25,
                ["netProduced"] = 575,
                ["hasHandwritingStrike"] = false
            },
            new JsonObject
            {
                ["rowNumber"] = 2,
                ["productName"] = "شفت گیربکس صنعتی ۶ دنده",
                ["rawMaterialUsed"] = 430,
                ["totalProduced"] = 420,
                ["wasteCount"] = 13, // Agent B read 13 due to strike-through over 8/3
                ["netProduced"] = 407,
                ["hasHandwritingStrike"] = true
            },
            new JsonObject
            {
                ["rowNumber"] = 3,
                ["productName"] = "بوش برنجی خودران دینام 4KW",
                ["rawMaterialUsed"] = 850,
                ["totalProduced"] = 820,
                ["wasteCount"] = 40,
                ["netProduced"] = 790, // Read what was on paper
                ["hasHandwritingStrike"] = false
            },
            new JsonObject
            {
                ["rowNumber"] = 4,
                ["productName"] = "فلنج رابط چدنی قطر ۱۲۰mm",
                ["rawMaterialUsed"] = 310,
                ["totalProduced"] = 300,
                ["wasteCount"] = 12,
                ["netProduced"] = 288,
                ["hasHandwritingStrike"] = false
            },
            new JsonObject
            {
                ["rowNumber"] = 5,
                ["productName"] = "یاتاقان کاسه‌ای فولادی سری V",
                ["rawMaterialUsed"] = 550,
                ["totalProduced"] = 540,
                ["wasteCount"] = 35, // Agent B read 35 due to ink smudge
                ["netProduced"] = 505,
                ["hasHandwritingStrike"] = true
            }
        },
        ["summary"] = new JsonObject
        {
            ["totalProductionSum"] = 2680,
            ["totalWasteSum"] = 125,
            ["totalNetSum"] = 2565
        }
    };

    var finalVerifiedData = new JsonObject
    {
        ["reportDate"] = "۱۴۰۳/۰۷/۱۸",
        ["factoryName"] = "صنایع متالورژی و قطعه‌سازی پیشگام البرز (واحد پرس‌کاری)",
        ["shiftSupervisor"] = "مهندس علیرضا سلیمانی",
        ["items"] = new JsonArray
        {
            new JsonObject
            {
                ["rowNumber"] = 1,
                ["productName"] = "پوسته پمپ هیدرولیک تیپ A-20",
                ["rawMaterialUsed"] = 620,
                ["totalProduced"] = 600,
                ["wasteCount"] = 25,
                ["netProduced"] = 575,
                ["hasHandwritingStrike"] = false,
                ["status"] = "verified"
            },
            new JsonObject
            {
                ["rowNumber"] = 2,
                ["productName"] = "شفت گیربکس صنعتی ۶ دنده",
                ["rawMaterialUsed"] = 430,
                ["totalProduced"] = 420,
                ["wasteCount"] = 18,
                ["netProduced"] = 402,
                ["hasHandwritingStrike"] = true,
                ["status"] = "resolved_strike"
            },
            new JsonObject
            {
                ["rowNumber"] = 3,
                ["productName"] = "بوش برنجی خودران دینام 4KW",
                ["rawMaterialUsed"] = 850,
                ["totalProduced"] = 820,
                ["wasteCount"] = 40,
                ["netProduced"] = 780, // Corrected by Judge from 790 to 780
                ["hasHandwritingStrike"] = false,
                ["status"] = "math_corrected"
            },
            new JsonObject
            {
                ["rowNumber"] = 4,
                ["productName"] = "فلنج رابط چدنی قطر ۱۲۰mm",
                ["rawMaterialUsed"] = 310,
                ["totalProduced"] = 300,
                ["wasteCount"] = 12,
                ["netProduced"] = 288,
                ["hasHandwritingStrike"] = false,
                ["status"] = "verified"
            },
            new JsonObject
            {
                ["rowNumber"] = 5,
                ["productName"] = "یاتاقان کاسه‌ای فولادی سری V",
                ["rawMaterialUsed"] = 550,
                ["totalProduced"] = 540,
                ["wasteCount"] = 30,
                ["netProduced"] = 510,
                ["hasHandwritingStrike"] = true,
                ["status"] = "resolved_strike"
            }
        },
        ["summary"] = new JsonObject
        {
            ["totalProductionSum"] = 2680,
            ["totalWasteSum"] = 125,
            ["totalNetSum"] = 2555 // Corrected sum: 2680 - 125 = 2555
        }
    };

    var differencesFound = new JsonArray
    {
        new JsonObject
        {
            ["field"] = "ردیف ۲ - ستون ضایعات (Waste Count)",
            ["agentAValue"] = "۱۸ عدد",
            ["agentBValue"] = "۱۳ عدد",
            ["judgeDecision"] = "۱۸ عدد (تایید خوانش ایجنت A)",
            ["reason"] = "بررسی زوم ۵۰۰٪ تصویر دست‌خط نشان می‌دهد نویسنده ابتدا عدد ۱۳ را نوشته اما با خودکار آبی پررنگ آن را خط زده و عدد ۱۸ را به وضوح در بالای آن رونویسی کرده است. تصمیم ایجنت A تایید شد."
        },
        new JsonObject
        {
            ["field"] = "ردیف ۵ - ستون ضایعات (Waste Count)",
            ["agentAValue"] = "۳۰ عدد",
            ["agentBValue"] = "۳۵ عدد",
            ["judgeDecision"] = "۳۰ عدد (تایید خوانش ایجنت A)",
            ["reason"] = "در تصویر لکه جوهر روی گوشه سمت راست صفر قرار دارد که ایجنت B آن را به اشتباه دندانه عدد ۵ فرض کرده است. سرایت جوهر سطحی بوده و فرم بیضی رقم صفر دست‌نویس کاملاً محرز است."
        }
    };

    var mathErrorsOnPaper = new JsonArray
    {
        new JsonObject
        {
            ["rowNumber"] = 3,
            ["paperValue"] = "۷۹۰ عدد",
            ["correctMathValue"] = "۷۸۰ عدد",
            ["description"] = "خطای محاسباتی انسانی روی برگه فیزیکی: در ردیف ۳، تولید کل برابر ۸۲۰ و ضایعات ۴۰ عدد ثبت شده است. تفریق صحیح (۸۲۰ - ۴۰) برابر ۷۸۰ است، اما سرپرست شیفت به صورت دستی روی برگه ۷۹۰ درج نموده است (اختلاف +۱۰ عدد)."
        },
        new JsonObject
        {
            ["rowNumber"] = 0,
            ["paperValue"] = "۲۵۶۵ عدد (مجموع نهایی برگه)",
            ["correctMathValue"] = "۲۵۵۵ عدد",
            ["description"] = "خطای تراز جمع ستون در انتهای فرم: به دلیل خطای ۱۰ عددی در ردیف ۳، جمع کل تولید خالص برگه نیز ۲۵۶۵ نوشته شده بود که در ممیزی داور به رقم واقعی ۲۵۵۵ تصحیح گردید."
        }
    };

    var judge = new JsonObject
    {
        ["finalVerifiedData"] = finalVerifiedData,
        ["differencesFound"] = differencesFound,
        ["mathErrorsOnPaper"] = mathErrorsOnPaper,
        ["confidenceScore"] = 99.4
    };

    return new JsonObject
    {
        ["agentA"] = agentA,
        ["agentB"] = agentB,
        ["judge"] = judge,
        ["processingTimeMs"] = 1845
    };
}
