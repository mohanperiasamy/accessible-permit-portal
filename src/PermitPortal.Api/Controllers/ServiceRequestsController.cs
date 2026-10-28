using Microsoft.AspNetCore.Mvc;
using PermitPortal.Api.Contracts;
using PermitPortal.Api.Domain;
using PermitPortal.Api.Services;

namespace PermitPortal.Api.Controllers;

[ApiController]
[Route("api/service-requests")]
public class ServiceRequestsController(IServiceRequestService service) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<ServiceRequestDto>>> List([FromQuery] RequestStatus? status, CancellationToken ct)
        => Ok(await service.ListAsync(status, ct));

    [HttpGet("{id:int}")]
    public async Task<ActionResult<ServiceRequestDto>> Get(int id, CancellationToken ct)
    {
        var result = await service.GetAsync(id, ct);
        return result.Succeeded ? Ok(result.Value) : Problem(result.Message, statusCode: 404);
    }

    // [ApiController] returns a 400 ValidationProblemDetails automatically when the DTO's data annotations fail.
    [HttpPost]
    public async Task<ActionResult<ServiceRequestDto>> Create(CreateServiceRequestDto input, CancellationToken ct)
    {
        var created = await service.CreateAsync(input, ct);
        return CreatedAtAction(nameof(Get), new { id = created.Id }, created);
    }

    [HttpPatch("{id:int}/status")]
    public async Task<ActionResult<ServiceRequestDto>> UpdateStatus(int id, UpdateStatusDto input, CancellationToken ct)
    {
        var result = await service.UpdateStatusAsync(id, input.Status!.Value, ct);
        return result.Error switch
        {
            ServiceError.None => Ok(result.Value),
            ServiceError.NotFound => Problem(result.Message, statusCode: 404),
            _ => Problem(result.Message, statusCode: 409)
        };
    }
}
