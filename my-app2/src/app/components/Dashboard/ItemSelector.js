// my-app2/src/app/components/Dashboard/ItemSelector.js

export const ItemSelector = ({ 
    items, 
    selectedIndex, 
    onSelectionChange, 
    onAddItem, 
    userType,
    showAddButton = true 
  }) => {
    if (items.length <= 1) return null;
  
    const getAddButtonText = () => {
      return userType === 'teacher' ? 'Add Another Student' : 'Add Another Child';
    };
  
    return (
      <div className="bg-gray-800 p-6 rounded-lg shadow-xl mb-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <h2 className="text-white text-xl font-semibold">Viewing progress for:</h2>
            <select
              value={selectedIndex}
              onChange={onSelectionChange}
              className="bg-gray-700 text-white border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {items.map((item, index) => (
                <option key={index} value={index}>
                  {item.fullName || item.name} ({item.email})
                </option>
              ))}
            </select>
          </div>
          {showAddButton && (
            <button
              onClick={onAddItem}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors duration-200 font-medium"
            >
              {getAddButtonText()}
            </button>
          )}
        </div>
      </div>
    );
  };