using WebApplication2.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using WebApplication2;
using WebApplication2.Repositories;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle

var connectionString = "Host=localhost;Database=webapp;Username=postgres;Password=postgres";
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(connectionString));



builder.Services.AddTransient<IUnitOfWork, UnitOfWork>();
//builder.Services.AddTransient(typeof(IGenericService<>), typeof(GenericService<>));
//builder.Services.AddTransient(typeof(IGenericRepository<>), typeof(GenericRepository<>));
builder.Services.AddTransient(typeof(IGeometryRepository), typeof(GeometryRepository));
builder.Services.AddScoped<IGeometryRepository, GeometryRepository>();



// Configure CORS policy
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowLocalhost",
        builder => builder
            .WithOrigins("http://127.0.0.1:5500", "http://localhost:5500")  // Allow frontend URL
            .AllowAnyMethod()
            .AllowAnyHeader());
});


builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();


var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();


// Use the CORS policy
app.UseCors("AllowLocalhost");
app.UseAuthorization();


app.MapControllers();

app.Run();
