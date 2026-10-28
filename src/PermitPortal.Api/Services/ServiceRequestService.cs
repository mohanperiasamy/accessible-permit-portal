using System.Text.RegularExpressions;
using Microsoft.EntityFrameworkCore;
using PermitPortal.Api.Contracts;
using PermitPortal.Api.Data;
using PermitPortal.Api.Domain;

namespace PermitPortal.Api.Services;

public interface IServiceRequestService
{
    Task<ServiceRequestDto> CreateAsync(CreateServiceRequestDto input, CancellationToken ct = default);
    Task<IReadOnlyList<ServiceRequestDto>> ListAsync(RequestStatus? status = null, CancellationToken ct = default);
    Task<ServiceResult<ServiceRequestDto>> GetAsync(int id, CancellationToken ct = default);
    Task<ServiceResult<ServiceRequestDto>> UpdateStatusAsync(int id, RequestStatus newStatus, CancellationToken ct = default);
}

/// <summary>Business logic for service requests. Controllers stay thin and call this layer.</summary>
public class ServiceRequestService(AppDbContext db, ISensitiveDataProtector protector, TimeProvider clock) : IServiceRequestService
{
    // Allowed status changes. Anything not listed here is rejected.
    private static readonly Dictionary<RequestStatus, RequestStatus[]> AllowedTransitions = new()
    {
        [RequestStatus.Submitted] = [RequestStatus.InReview, RequestStatus.Rejected],
        [RequestStatus.InReview] = [RequestStatus.Approved, RequestStatus.Rejected],
        [RequestStatus.Approved] = [RequestStatus.Closed],
        [RequestStatus.Rejected] = [RequestStatus.Closed],
        [RequestStatus.Closed] = []
    };

    public async Task<ServiceRequestDto> CreateAsync(CreateServiceRequestDto input, CancellationToken ct = default)
    {
        var now = clock.GetUtcNow().UtcDateTime;
        var digits = Regex.Replace(input.Phone, "[^0-9]", "");

        var entity = new ServiceRequest
        {
            ReferenceNumber = await NextReferenceAsync(now, ct),
            Type = input.Type!.Value,
            Status = RequestStatus.Submitted,
            ApplicantName = input.ApplicantName.Trim(),
            ApplicantEmail = input.ApplicantEmail.Trim().ToLowerInvariant(),
            ProtectedPhone = protector.Protect(digits),
            PhoneLast4 = digits.Length >= 4 ? digits[^4..] : digits,
            Address = input.Address.Trim(),
            Description = input.Description.Trim(),
            CreatedUtc = now,
            UpdatedUtc = now
        };

        db.ServiceRequests.Add(entity);
        await db.SaveChangesAsync(ct);
        return ToDto(entity);
    }

    public async Task<IReadOnlyList<ServiceRequestDto>> ListAsync(RequestStatus? status = null, CancellationToken ct = default)
    {
        var query = db.ServiceRequests.AsNoTracking();
        if (status is not null) query = query.Where(x => x.Status == status);
        var items = await query.OrderByDescending(x => x.Id).ToListAsync(ct);
        return items.Select(ToDto).ToList();
    }

    public async Task<ServiceResult<ServiceRequestDto>> GetAsync(int id, CancellationToken ct = default)
    {
        var entity = await db.ServiceRequests.AsNoTracking().FirstOrDefaultAsync(x => x.Id == id, ct);
        return entity is null
            ? ServiceResult<ServiceRequestDto>.Fail(ServiceError.NotFound, $"Request {id} was not found.")
            : ServiceResult<ServiceRequestDto>.Ok(ToDto(entity));
    }

    public async Task<ServiceResult<ServiceRequestDto>> UpdateStatusAsync(int id, RequestStatus newStatus, CancellationToken ct = default)
    {
        var entity = await db.ServiceRequests.FirstOrDefaultAsync(x => x.Id == id, ct);
        if (entity is null)
            return ServiceResult<ServiceRequestDto>.Fail(ServiceError.NotFound, $"Request {id} was not found.");

        if (!AllowedTransitions[entity.Status].Contains(newStatus))
            return ServiceResult<ServiceRequestDto>.Fail(ServiceError.InvalidTransition,
                $"A request that is {entity.Status} cannot be changed to {newStatus}.");

        entity.Status = newStatus;
        entity.UpdatedUtc = clock.GetUtcNow().UtcDateTime;
        await db.SaveChangesAsync(ct);
        return ServiceResult<ServiceRequestDto>.Ok(ToDto(entity));
    }

    /// <summary>Decrypts the stored phone number. Only for authorized server-side use; not exposed by the API.</summary>
    public string RevealPhone(ServiceRequest entity) => protector.Unprotect(entity.ProtectedPhone);

    private async Task<string> NextReferenceAsync(DateTime now, CancellationToken ct)
    {
        var prefix = $"SR-{now:yyyyMMdd}-";
        var countToday = await db.ServiceRequests.CountAsync(x => x.ReferenceNumber.StartsWith(prefix), ct);
        return $"{prefix}{countToday + 1:D4}";
    }

    private static ServiceRequestDto ToDto(ServiceRequest x) => new(
        x.Id, x.ReferenceNumber, x.Type, x.Status, x.ApplicantName, x.ApplicantEmail,
        $"***-***-{x.PhoneLast4}", x.Address, x.Description,
        DateTime.SpecifyKind(x.CreatedUtc, DateTimeKind.Utc), DateTime.SpecifyKind(x.UpdatedUtc, DateTimeKind.Utc));
}
