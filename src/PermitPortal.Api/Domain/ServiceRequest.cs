namespace PermitPortal.Api.Domain;

public enum RequestType
{
    BuildingPermit,
    StreetRepair,
    SignPermit,
    Other
}

public enum RequestStatus
{
    Submitted,
    InReview,
    Approved,
    Rejected,
    Closed
}

/// <summary>A resident's service request or permit application.</summary>
public class ServiceRequest
{
    public int Id { get; set; }

    /// <summary>Human-friendly reference, e.g. SR-20261027-0001.</summary>
    public string ReferenceNumber { get; set; } = string.Empty;

    public RequestType Type { get; set; }
    public RequestStatus Status { get; set; } = RequestStatus.Submitted;

    public string ApplicantName { get; set; } = string.Empty;
    public string ApplicantEmail { get; set; } = string.Empty;

    /// <summary>Phone number encrypted with the ASP.NET Core Data Protection API. Never stored in plain text.</summary>
    public string ProtectedPhone { get; set; } = string.Empty;

    /// <summary>Last four digits, kept separately so lists can show a masked value without decrypting.</summary>
    public string PhoneLast4 { get; set; } = string.Empty;

    public string Address { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;

    public DateTime CreatedUtc { get; set; }
    public DateTime UpdatedUtc { get; set; }
}
