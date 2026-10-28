using Microsoft.AspNetCore.DataProtection;

namespace PermitPortal.Api.Services;

/// <summary>Encrypts and decrypts sensitive fields using the ASP.NET Core Data Protection API.</summary>
public interface ISensitiveDataProtector
{
    string Protect(string plainText);
    string Unprotect(string protectedText);
}

public class SensitiveDataProtector(IDataProtectionProvider provider) : ISensitiveDataProtector
{
    // The purpose string isolates these keys from any other use of Data Protection in the app.
    private readonly IDataProtector _protector = provider.CreateProtector("PermitPortal.ApplicantPhone.v1");

    public string Protect(string plainText) => _protector.Protect(plainText);

    public string Unprotect(string protectedText) => _protector.Unprotect(protectedText);
}
