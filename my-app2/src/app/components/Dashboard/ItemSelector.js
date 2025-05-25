export const ItemSelector = ({ 
    items, 
    selectedIndex, 
    onSelectionChange, 
    onAddItem, 
    onRemoveItem,
    userType,
    showAddButton = true,
    showRemoveButton = true
  }) => {
    if (!items || items.length === 0) return null;
  
    const getAddButtonText = () => {
      return userType === 'teacher' ? 'Add Another Student' : 'Add Another Child';
    };
  
    const getRemoveButtonText = () => {
      return userType === 'teacher' ? 'Remove Student' : 'Remove Child';
    };
  
    return (
      <div className="bg-gray-800 p-6 rounded-lg shadow-xl mb-6">
        <div className="flex flex-col items-start">
          <div className="w-full mb-8">
            <h2 className="text-white text-xl font-semibold mb-2">Viewing progress for:</h2>
            <select
              value={selectedIndex}
              onChange={onSelectionChange}
              className="min-w-[300px] bg-gray-700 text-white border border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 hover:border-gray-500"
            >
              {items.map((item, index) => (
                <option key={index} value={index}>
                  {item.fullName || item.name} ({item.email})
                </option>
              ))}
            </select>
          </div>
          <div className="w-full pt-8 flex space-x-3">
            {/* Add Button */}
            {showAddButton && (
              <button
                onClick={onAddItem}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors duration-200 font-medium"
              >
                {getAddButtonText()}
              </button>
            )}
            {/* Remove Button */}
            {showRemoveButton && items.length > 0 && (
              <button
                onClick={() => onRemoveItem(items[selectedIndex])}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors duration-200 font-medium"
              >
                {getRemoveButtonText()}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };