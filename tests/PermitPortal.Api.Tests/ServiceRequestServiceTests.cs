using Microsoft.AspNetCore.DataProtection;
using Microsoft.EntityFrameworkCore;
using PermitPortal.Api.Contracts;
using PermitPortal.Api.Data;
using PermitPortal.Api.Domain;
using PermitPortal.Api.Services;

namespace PermitPortal.Api.Tests;

public class ServiceRequestServiceTests
{
    private sealed class FixedClock(DateTimeOffset now) : TimeProvider
    {
        public override DateTimeOffset GetUtcNow() => now;
    }

    private static (ServiceRequestService Service, AppDbContext Db, ISensitiveDataProtector Protector) Create()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        var db = new AppDbContext(options);
        var protector = new SensitiveDataProtector(new EphemeralDataProtectionProvider());
        var clock = new FixedClock(new DateTimeOffset(2026, 10, 27, 15, 0, 0, TimeSpan.Zero));
        return (new ServiceRequestService(db, protector, clock), db, protector);
    }

    private static CreateServiceRequestDto ValidInput() => new()
    {
        Type = RequestType.BuildingPermit,
        ApplicantName = "  Test Applicant ",
        ApplicantEmail = "Test.Applicant@Example.com",
        Phone = "(555) 010-9876",
        Address = "1 Test Road",
        Description = "Permit for a small deck."
    };

    [Fact]
    public async Task Create_assigns_reference_number_and_submitted_status()
    {
        var (service, _, _) = Create();

        var first = await service.CreateAsync(ValidInput());
        var second = await service.CreateAsync(ValidInput());

        Assert.Equal("SR-20261027-0001", first.ReferenceNumber);
        Assert.Equal("SR-20261027-0002", second.ReferenceNumber);
        Assert.Equal(RequestStatus.Submitted, first.Status);
    }

    [Fact]
    public async Task Create_trims_and_normalizes_input()
    {
        var (service, _, _) = Create();

        var dto = await service.CreateAsync(ValidInput());

        Assert.Equal("Test Applicant", dto.ApplicantName);
        Assert.Equal("test.applicant@example.com", dto.ApplicantEmail);
    }

    [Fact]
    public async Task Create_encrypts_phone_and_returns_only_masked_value()
    {
        var (service, db, protector) = Create();

        var dto = await service.CreateAsync(ValidInput());
        var stored = await db.ServiceRequests.SingleAsync();

        Assert.DoesNotContain("5550109876", stored.ProtectedPhone);
        Assert.Equal("5550109876", protector.Unprotect(stored.ProtectedPhone));
        Assert.Equal("***-***-9876", dto.MaskedPhone);
    }

    [Fact]
    public async Task List_filters_by_status()
    {
        var (service, _, _) = Create();
        var a = await service.CreateAsync(ValidInput());
        await service.CreateAsync(ValidInput());
        await service.UpdateStatusAsync(a.Id, RequestStatus.InReview);

        var inReview = await service.ListAsync(RequestStatus.InReview);
        var all = await service.ListAsync();

        Assert.Single(inReview);
        Assert.Equal(2, all.Count);
    }

    [Fact]
    public async Task Get_returns_not_found_for_unknown_id()
    {
        var (service, _, _) = Create();

        var result = await service.GetAsync(999);

        Assert.False(result.Succeeded);
        Assert.Equal(ServiceError.NotFound, result.Error);
    }

    [Theory]
    [InlineData(RequestStatus.InReview, true)]
    [InlineData(RequestStatus.Rejected, true)]
    [InlineData(RequestStatus.Approved, false)]
    [InlineData(RequestStatus.Closed, false)]
    public async Task UpdateStatus_enforces_allowed_transitions_from_submitted(RequestStatus target, bool allowed)
    {
        var (service, _, _) = Create();
        var created = await service.CreateAsync(ValidInput());

        var result = await service.UpdateStatusAsync(created.Id, target);

        Assert.Equal(allowed, result.Succeeded);
        if (!allowed) Assert.Equal(ServiceError.InvalidTransition, result.Error);
    }

    [Fact]
    public async Task UpdateStatus_returns_not_found_for_unknown_id()
    {
        var (service, _, _) = Create();

        var result = await service.UpdateStatusAsync(42, RequestStatus.InReview);

        Assert.Equal(ServiceError.NotFound, result.Error);
    }
}
