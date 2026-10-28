using System.ComponentModel.DataAnnotations;
using PermitPortal.Api.Contracts;
using PermitPortal.Api.Domain;

namespace PermitPortal.Api.Tests;

public class ValidationTests
{
    private static List<ValidationResult> Validate(object model)
    {
        var results = new List<ValidationResult>();
        Validator.TryValidateObject(model, new ValidationContext(model), results, validateAllProperties: true);
        return results;
    }

    [Fact]
    public void Empty_request_reports_a_clear_message_for_each_required_field()
    {
        var errors = Validate(new CreateServiceRequestDto());

        var fields = errors.SelectMany(e => e.MemberNames).ToHashSet();
        Assert.Contains(nameof(CreateServiceRequestDto.Type), fields);
        Assert.Contains(nameof(CreateServiceRequestDto.ApplicantName), fields);
        Assert.Contains(nameof(CreateServiceRequestDto.ApplicantEmail), fields);
        Assert.Contains(nameof(CreateServiceRequestDto.Phone), fields);
        Assert.Contains(nameof(CreateServiceRequestDto.Address), fields);
        Assert.Contains(nameof(CreateServiceRequestDto.Description), fields);
    }

    [Theory]
    [InlineData("not-an-email")]
    [InlineData("missing-at.example.com")]
    public void Invalid_email_is_rejected(string email)
    {
        var input = new CreateServiceRequestDto
        {
            Type = RequestType.Other, ApplicantName = "Sam Doe", ApplicantEmail = email,
            Phone = "555-010-0000", Address = "1 Test Road", Description = "Something to fix here."
        };

        var errors = Validate(input);

        Assert.Contains(errors, e => e.MemberNames.Contains(nameof(CreateServiceRequestDto.ApplicantEmail)));
    }
}
