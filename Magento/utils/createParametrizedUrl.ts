export enum CONNECTORS {
  AND,
  OR
}

type ParamType = {
  field: string;
  value: string;
  condition_type: string;
  sort_field: string;
  direction: string;
  search_phrase: string;
  pageSize: number;
  currentPage: number;
  connector: CONNECTORS;
};

// @TODO: make typing that if "sort_field" is passed then "direction" must be passed too
export default function createParametrizedUrl(url: string, params: Partial<ParamType>[]) {
  return (
    url +
    params
      .map((param: Partial<ParamType>, index, array) => {
        let searchQuery = '';
        let ampersand = array.length === 1 || index == 0 ? '?' : '&';
        const filtersGroupIndex = param.connector === CONNECTORS.AND ? index : 0;
        const filtersIndex = param.connector === CONNECTORS.OR ? index : 0;

        if (param.field) {
          searchQuery += `${ampersand}searchCriteria[filter_groups][${filtersGroupIndex}][filters][${filtersIndex}][field]=${param.field}`;
        }
        if (param.value) {
          searchQuery += `&searchCriteria[filter_groups][${filtersGroupIndex}][filters][${filtersIndex}][value]=${param.value}`;
        }
        if (param.condition_type) {
          searchQuery += `&searchCriteria[filter_groups][${filtersGroupIndex}][filters][${filtersIndex}][condition_type]=${param.condition_type}`;
        }
        if (param.direction) {
          searchQuery += `${ampersand}searchCriteria[sortOrders][${filtersGroupIndex}][direction]=${param.direction}`;
        }
        if (param.sort_field) {
          searchQuery += `&searchCriteria[sortOrders][${filtersGroupIndex}][field]=${param.sort_field}`;
        }
        if (param.search_phrase) {
          searchQuery += `${ampersand}searchCriteria[search_phrase]=${param.search_phrase}`;
        }
        if (param.pageSize) {
          searchQuery += `${ampersand}searchCriteria[pageSize]=${param.pageSize}`;
        }
        if (param.currentPage) {
          searchQuery += `${ampersand}searchCriteria[currentPage]=${param.currentPage}`;
        }

        return searchQuery;
      })
      .join('')
  );
}
