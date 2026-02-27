namespace Eolvis.App.Models;

/// <summary>
/// Standardised error response returned from API endpoints.
/// Avoids leaking internal exception details to the client.
/// </summary>
public class ErrorResponse
{
    public string Message { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
    public string? TraceId { get; set; }

    public static ErrorResponse BadRequest(string message, string? traceId = null) =>
        new() { Message = message, Code = "BAD_REQUEST", TraceId = traceId };

    public static ErrorResponse Unauthorized(string message, string? traceId = null) =>
        new() { Message = message, Code = "UNAUTHORIZED", TraceId = traceId };

    public static ErrorResponse InternalError(string? traceId = null) =>
        new() { Message = "An unexpected error occurred.", Code = "INTERNAL_ERROR", TraceId = traceId };
}
