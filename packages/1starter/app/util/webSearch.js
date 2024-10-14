import { search } from 'duck-duck-scrape';

const webSearch = async (query) => {
	const searchInternet = await search(query, {
		safeSearch: 0
	});

	const searchResult = searchInternet.results
	return searchResult;
};

export default webSearch;