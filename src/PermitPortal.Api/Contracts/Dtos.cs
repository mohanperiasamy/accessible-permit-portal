using System.ComponentModel.DataAnnotations;
using PermitPortal.Api.Domain;

namespace PermitPortal.Api.Contracts;

public class CreateServiceRequestDto
{
    [Required(ErrorMessage = "Choose a request type.")]
    public RequestType? Type { get; set; }

    [Required(ErrorMessage = "Enter your full name.")]
    [StringLength(100, MinimumLength = 2, ErrorMessage = "Name must be 2 to 100 characters.")]
    public string ApplicantName { get; set; } = string.Empty;

    [Required(ErrorMessage = "Enter your email address.")]
    [EmailAddress(ErrorMessage = "Enter a valid email address, like name@example.com.")]
    [StringLength(254)]
    public string ApplicantEmail { get; set; } = string.Empty;

    [Required(ErrorMessage = "Enter a phone number.")]
    [RegularExpression(@"^\+?[0-9 ().-]{10,20}$", ErrorMessage = "Enter a phone number with at least 10 digits.")]
    public string Phone { get; set; } = string.Empty;

    [Required(ErrorMessage = "Enter the street address for this request.")]
    [StringLength(200, MinimumLength = 5, ErrorMessage = "Address must be 5 to 200 characters.")]
    public string Address { get; set; } = string.Empty;

    [Required(ErrorMessage = "Describe the request.")]
    [StringLength(2000, MinimumLength = 10, ErrorMessage = "Description must be 10 to 2000 characters.")]
    public string Description { get; set; } = string.Empty;
}

public class UpdateStatusDto
{
    [Required(ErrorMessage = "Choose a status.")]
    public RequestStatus? Status { get; set; }
}

/// <summary>What the API returns. The phone number is masked; the encrypted value never leaves the server.</summary>
public record ServiceRequestDto(
    int Id,
    string ReferenceNumber,
    RequestType Type,
    RequestStatus Status,
    string ApplicantName,
    string ApplicantEmail,
    string MaskedPhone,
    string Address,
    string Description,
    DateTime CreatedUtc,
    DateTime UpdatedUtc);
