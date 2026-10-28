using Microsoft.EntityFrameworkCore;
using PermitPortal.Api.Domain;

namespace PermitPortal.Api.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<ServiceRequest> ServiceRequests => Set<ServiceRequest>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        var e = modelBuilder.Entity<ServiceRequest>();
        e.HasKey(x => x.Id);
        e.HasIndex(x => x.ReferenceNumber).IsUnique();
        e.HasIndex(x => x.Status);
        e.Property(x => x.ReferenceNumber).HasMaxLength(20).IsRequired();
        e.Property(x => x.ApplicantName).HasMaxLength(100).IsRequired();
        e.Property(x => x.ApplicantEmail).HasMaxLength(254).IsRequired();
        e.Property(x => x.ProtectedPhone).HasMaxLength(1000).IsRequired();
        e.Property(x => x.PhoneLast4).HasMaxLength(4);
        e.Property(x => x.Address).HasMaxLength(200).IsRequired();
        e.Property(x => x.Description).HasMaxLength(2000).IsRequired();
        // Store enums as readable strings (works the same on SQLite and SQL Server).
        e.Property(x => x.Type).HasConversion<string>().HasMaxLength(30);
        e.Property(x => x.Status).HasConversion<string>().HasMaxLength(30);
    }
}
