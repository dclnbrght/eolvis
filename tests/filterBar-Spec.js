import { exportForTesting } from '../src/web/components/filterBar.js';

const { setSelectBoxValues, getSelectBoxValues, typeNameFilterArray } = exportForTesting;

describe("filterBar", function () {

  let mockNodeList = [];
  beforeEach(function () {
    var mockOption0 = document.createElement('option');
    mockOption0.value = "Value0";
    var mockOption1 = document.createElement('option');
    mockOption1.value = "Value1";
    var mockOption2 = document.createElement('option');
    mockOption2.value = "Value2";

    mockNodeList = document.createDocumentFragment();
    mockNodeList.appendChild(mockOption0);
    mockNodeList.appendChild(mockOption1);
    mockNodeList.appendChild(mockOption2);

    document.querySelectorAll = jasmine.createSpy('Option Element').and.returnValue(mockNodeList.childNodes);
  });

  describe('setSelectBoxValues', () => {
    it("should be able to set dropdown option values", () => {
      setSelectBoxValues("dummy", ["Value0", "Value2"]);

      expect(mockNodeList.childNodes[0].selected).toEqual(true);
      expect(mockNodeList.childNodes[1].selected).toEqual(false);
      expect(mockNodeList.childNodes[2].selected).toEqual(true);
    });
  });

  describe('getSelectBoxValues', () => {
    it("should be able to get dropdown option values", () => {
      setSelectBoxValues("dummy", ["Value1", "Value2"]);

      const selectedValues = getSelectBoxValues("dummy");

      expect(selectedValues).toEqual(["Value1", "Value2"]);
    });
  });

  describe('typeNameFilterArray', () => {
    // Sample JSON data for testing
    const jsonData = {
      components: [
        {
          type: 'Type1',
          name: 'Name1',
        },
        {
          type: 'Type2',
          name: 'Name2',
        },
        {
          type: 'Type1',
          name: 'Name3',
        },
      ],
    };

    it('should create a nested array of unique component names for each component type', () => {
      const result = typeNameFilterArray(jsonData);

      // Assert that the result is an array
      expect(Array.isArray(result)).toBe(true);

      // Assert the structure of the result
      expect(result).toEqual([
        {
          type: 'Type1',
          names: ['Name1', 'Name3'],
        },
        {
          type: 'Type2',
          names: ['Name2'],
        },
      ]);

      // Check specific values if needed
      expect(result[0].type).toBe('Type1');
      expect(result[1].names).toContain('Name2');
    });

    it('should handle an empty input data', () => {
      const emptyData = {
        components: [],
      };
      const result = typeNameFilterArray(emptyData);

      // Assert that the result is an empty array
      expect(result).toEqual([]);
    });

  });

});