import { Request, Response } from "express";
import { getCustomRepository } from "typeorm";
import { AppError } from "../errors/AppError";
import { SurveysUsersRepository } from "../repositories/SurveysUsersRepository";

class AnswerController {

  async execute(request: Request, response: Response) {
    const { value } = request.params;
    const { u } = request.query;

    const surveysUserReposoitory = getCustomRepository(SurveysUsersRepository);
    const surveyUser = await surveysUserReposoitory.findOne({
      id: String(u)
    });

    if(!surveyUser) {
      throw new AppError("Survey User does not exists");
    }

    surveyUser.value = Number(value);

    await surveysUserReposoitory.save(surveyUser);

    return response.json(surveyUser);
  }
}

export { AnswerController };