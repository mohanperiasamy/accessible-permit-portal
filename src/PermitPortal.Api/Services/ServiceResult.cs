namespace PermitPortal.Api.Services;

public enum ServiceError
{
    None,
    NotFound,
    InvalidTransition
}

/// <summary>Lets the service layer report expected failures without throwing.</summary>
public record ServiceResult<T>(T? Value, ServiceError Error = ServiceError.None, string? Message = null)
{
    public bool Succeeded => Error == ServiceError.None;

    public static ServiceResult<T> Ok(T value) => new(value);
    public static ServiceResult<T> Fail(ServiceError error, string message) => new(default, error, message);
}
