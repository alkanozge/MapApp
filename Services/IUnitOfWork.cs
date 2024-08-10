using System;
using WebApplication2.Repositories;

namespace WebApplication2.Services
{
    public interface IUnitOfWork : IDisposable
    {
        IGenericRepository<T> Repository<T>() where T : class;
        int Complete();
    }
}
