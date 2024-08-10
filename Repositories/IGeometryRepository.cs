namespace WebApplication2.Repositories
{
    public interface IGeometryRepository
    {
        
        IEnumerable<GeometryEntity> GetAll();
        GeometryEntity GetById(int id);
        void Insert(GeometryEntity entity);
        void Update(int id, GeometryEntity updatedEntity);
        void Delete(int id);
    }

}
