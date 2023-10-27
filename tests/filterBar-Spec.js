import * as filterBar from '../src/web/components/filterBar.js';

describe("filterBar", function () {

  let mockFilterBar = null;

  beforeEach(function () {
    mockFilterBar = document.createElement('filter-bar');
    mockFilterBar.id = "filter-bar";
  });

  // Sample JSON data for testing
  const jsonData = {
      components: [
        {
            name: "Item 1",
            version: "1",
            type: 'Type1',
            supportedFrom: "2020-01-01",
            supportedTo: "2021-01-01",
            supportedToExtended: "2021-01-01",
            useFrom: "2020-01-01",
            useTo: "2021-01-01",
        },
        {
            name: "Item 1",
            version: "2",
            type: 'Type1',
            supportedFrom: "2021-01-01",
            supportedTo: "2022-01-01",
            supportedToExtended: "2022-01-01",
            useFrom: "2021-01-01",
            useTo: "2022-01-01",
        },
        {
            name: "Item 2",
            version: "1",
            type: 'Type2',
            supportedFrom: "2023-01-01",
            supportedTo: "2023-12-01",
            supportedToExtended: "2023-12-01",
            useFrom: "2023-03-01",
            useTo: "2023-09-01",
        },
        {
            name: "Item 3",
            version: "1",
            type: 'Type1',
            supportedFrom: "2024-01-01",
            supportedTo: "2024-12-01",
            supportedToExtended: "2024-12-01",
            useFrom: "2024-03-01",
            useTo: "2024-09-01",
        },
    ]
  };
  
  describe('setupFilters', () => {

    it('should setup the filter bar with the correct number of filters', () => {
      // Arrange
      const data = jsonData;
      const filterSearch = () => {};

      // Act
      mockFilterBar.connectedCallback();
      mockFilterBar.setupFilters(data, filterSearch);

      // Assert
      const typeNameFilter = mockFilterBar.querySelector('#typeNameFilter');
      const periodFilter = mockFilterBar.querySelector('#periodFilter');
      expect(typeNameFilter.options.length).toBe(3);
      expect(periodFilter.options.length).toBe(3);
    });

  });
  

  describe('typeNameFilterArray', () => {
    
    it('should create a nested array of unique component names for each component type', () => {
      const result = mockFilterBar.typeNameFilterArray(jsonData);

      // Assert that the result is an array
      expect(Array.isArray(result)).toBe(true);

      // Assert the structure of the result
      expect(result).toEqual([
        {
          type: 'Type1',
          names: ['Item 1', 'Item 3'],
        },
        {
          type: 'Type2',
          names: ['Item 2'],
        },
      ]);

      // Check specific values if needed
      expect(result[0].type).toBe('Type1');
      expect(result[1].names).toContain('Item 2');
    });

    it('should handle an empty input data', () => {
      const emptyData = {
        components: [],
      };
      const result = mockFilterBar.typeNameFilterArray(emptyData);

      // Assert that the result is an empty array
      expect(result).toEqual([]);
    });

  });

});