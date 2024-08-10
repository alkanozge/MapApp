using System.Collections.Generic;

namespace WebApplication2.Services
{
    public interface IGenericService<T> where T : class
    {
        Response<List<T>> GetAll();
        Response<T> GetById(int id);
        Response<T> Add(T entity);
        Response<string> Update(int id, T updatedEntity);
        Response<string> Delete(int id);
    }
}
