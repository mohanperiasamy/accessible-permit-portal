using PermitPortal.Api.Contracts;
using PermitPortal.Api.Domain;
using PermitPortal.Api.Services;

namespace PermitPortal.Api.Data;

/// <summary>Adds a few fictional sample requests on first run so the UI has something to show.</summary>
public static class SeedData
{
    public static async Task EnsureSeededAsync(AppDbContext db, IServiceRequestService service)
    {
        if (db.ServiceRequests.Any()) return;

        await service.CreateAsync(new CreateServiceRequestDto
        {
            Type = RequestType.BuildingPermit,
            ApplicantName = "Alex Rivera",
            ApplicantEmail = "alex.rivera@example.com",
            Phone = "555-010-1234",
            Address = "100 Sample Street",
            Description = "Permit to build a 10 x 12 ft backyard shed."
        });
        await service.CreateAsync(new CreateServiceRequestDto
        {
            Type = RequestType.StreetRepair,
            ApplicantName = "Jordan Lee",
            ApplicantEmail = "jordan.lee@example.com",
            Phone = "555-010-5678",
            Address = "Corner of Example Ave and 3rd St",
            Description = "Large pothole in the eastbound lane near the crosswalk."
        });
    }
}
