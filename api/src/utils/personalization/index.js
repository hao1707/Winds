import axios from 'axios';
import jwt from 'jsonwebtoken';
import Article from '../../models/article';
import Podcast from '../../models/podcast';
import RSS from '../../models/rss';
import Episode from '../../models/episode';
import logger from '../../utils/logger';
import { getStreamClient } from '../../utils/stream';

import config from '../../config';

export async function getRecommendations(userID, type, limit) {
	if (!userID) {
		throw Error('missing user id');
	}
	const streamClient = getStreamClient();
	const path = `winds_${type}_recommendations`;
	const queryParams = {
		user_id: userID,
		limit: limit,
	};
	let response = await streamClient.personalization.get(path, queryParams);
	let objectIDs = response.data.results.map(result => {
		return result.foreign_id.split(':')[1];
	});

	return objectIDs;
}

export async function getRSSRecommendations(userID, limit = 20) {
	try {
		let ids = await getRecommendations(userID, 'rss', limit);
		return RSS.find({ _id: { $in: ids } });
	} catch (err) {
		logger.warn({ err });
		return [];
	}
}

export async function getPodcastRecommendations(userID, limit = 20) {
	try {
		let ids = await getRecommendations(userID, 'podcast', limit);
		return Podcast.find({ _id: { $in: ids } });
	} catch (err) {
		logger.warn({ err });
		return [];
	}
}

export async function getEpisodeRecommendations(userID, limit = 20) {
	try {
		let ids = await getRecommendations(userID, 'episode', limit);
		let episodes = await Episode.find({ _id: { $in: ids } });
		if (ids.length != episodes.length) {
			logger.warn(`failed to find some episodes from list ${ids.join(',')}`);
		}
		return episodes;
	} catch (err) {
		logger.warn({ err });
		return [];
	}
}

export async function getArticleRecommendations(userID, limit = 20) {
	try {
		let ids = await getRecommendations(userID, 'article', limit);
		let articles = await Article.find({ _id: { $in: ids } });
		if (ids.length != articles.length) {
			logger.warn(`failed to find some articles from list ${ids.join(',')}`);
		}
		return articles;
	} catch (err) {
		logger.warn({ err });
		return [];
	}
}
