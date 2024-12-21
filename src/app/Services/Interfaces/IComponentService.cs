using System.Collections.Generic;
using System.Threading.Tasks;
using Eolvis.App.Models;

namespace Eolvis.App.Services.Interfaces;

public interface IComponentService
{
    Task<List<Component>> GetAllComponents(string projectKey);

    Task<Component?> GetComponentById(string projectKey, Guid componentId);

    Task<List<ComponentCommand>> GetComponentCommandsById(string projectKey, Guid componentId);

    Task InsertCommand(string projectKey, Component component, string username);

    Task UpdateCommand(string projectKey, Component component, string username);
    
    Task DeleteCommand(string projectKey, Guid componentId, string username);
}
