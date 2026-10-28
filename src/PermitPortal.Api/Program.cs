using System.Text.Json.Serialization;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.EntityFrameworkCore;
using PermitPortal.Api.Data;
using PermitPortal.Api.Services;

var builder = WebApplication.CreateBuilder(args);

// Database: SQLite by default for easy local runs; set Database:Provider=SqlServer to use SQL Server.
var provider = builder.Configuration["Database:Provider"] ?? "Sqlite";
builder.Services.AddDbContext<AppDbContext>(options =>
{
    if (provider.Equals("SqlServer", StringComparison.OrdinalIgnoreCase))
        options.UseSqlServer(builder.Configuration.GetConnectionString("SqlServer"));
    else
        options.UseSqlite(builder.Configuration.GetConnectionString("Sqlite"));
});

// Data Protection keys are persisted to a local folder so encrypted values survive restarts.
// In production, persist keys to shared storage and protect them (e.g. Azure Blob Storage + Key Vault).
builder.Services.AddDataProtection()
    .SetApplicationName("PermitPortal")
    .PersistKeysToFileSystem(new DirectoryInfo(Path.Combine(builder.Environment.ContentRootPath, "keys")));

builder.Services.AddSingleton(TimeProvider.System);
builder.Services.AddSingleton<ISensitiveDataProtector, SensitiveDataProtector>();
builder.Services.AddScoped<IServiceRequestService, ServiceRequestService>();

builder.Services.AddControllers()
    .AddJsonOptions(o => o.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter()));
builder.Services.AddProblemDetails();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.EnsureCreated(); // Fine for a sample; a real app would use EF Core migrations.
    await SeedData.EnsureSeededAsync(db, scope.ServiceProvider.GetRequiredService<IServiceRequestService>());
}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseExceptionHandler();
app.UseDefaultFiles();
app.UseStaticFiles(); // Serves the built Angular app from wwwroot when published together.
app.MapControllers();
app.MapFallbackToFile("index.html");

app.Run();

public partial class Program;
