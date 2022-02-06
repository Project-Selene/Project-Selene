using System.Net;

namespace ProjectSelene;

public delegate Task<T> ResultFactory<T, R>(R request, HttpStatusCode status, object? result = null, IDictionary<string, string>? headers = null);