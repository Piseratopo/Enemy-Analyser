import * as competitorRepository from "./competitor.repository.js";

export const getCompetitors = async () => {
   return await competitorRepository.getAll();
};

export const cleanAndReseed = async () => {
   await competitorRepository.cleanDatabase();
   await competitorRepository.seedSampleData();
};