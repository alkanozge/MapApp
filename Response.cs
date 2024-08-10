namespace WebApplication2
{
    public class Response<T>
    {
        public T Value { get; set; }
        public string Message { get; set; }
        public bool Success { get; set; }

        public Response(T value, string message, bool success)
        {
            Value = value;
            Message = message;
            Success = success;
        }
    }
}
