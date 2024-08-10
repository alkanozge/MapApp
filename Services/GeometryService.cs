using WebApplication2;
using WebApplication2.Repositories;

public interface IGeometryService
{
    IEnumerable<GeometryEntity> GetGeometries(string type);
}

public class GeometryService : IGeometryService
{
    private readonly IGeometryRepository _geometryRepository;

    public GeometryService(IGeometryRepository geometryRepository)
    {
        _geometryRepository = geometryRepository;
    }

    public IEnumerable<GeometryEntity> GetGeometries(string type)
    {
        var geometries = _geometryRepository.GetAll();

        if (string.IsNullOrEmpty(type))
            return geometries;
        /*

        if (type.Equals("Point", StringComparison.OrdinalIgnoreCase))
            return geometries.Where(g => g.Type == "Point");

        if (type.Equals("Polygon", StringComparison.OrdinalIgnoreCase))
            return geometries.Where(g => g.Type == "Polygon");
        */

        return new List<GeometryEntity>();
    }
}
