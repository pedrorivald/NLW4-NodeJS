import { Request, Response } from "express";
import { getCustomRepository } from "typeorm";
import { SurveysRepository } from "../repositories/SurveysRepository";
import { SurveysUsersRepository } from "../repositories/SurveysUsersRepository";
import { UsersRepository } from "../repositories/UsersRepository";
import SendMailService from "../services/SendMailService";
import { resolve } from "path";

class SendMailController {
  async execute(request: Request, response: Response) {
    const { email, survey_id } = request.body;
    const usersRepository = getCustomRepository(UsersRepository);
    const surveysRepository = getCustomRepository(SurveysRepository);
    const surveysUsersRepository = getCustomRepository(SurveysUsersRepository);

    const usersAlreadyExists = await usersRepository.findOne({ email });

    if (!usersAlreadyExists) {
      return response.status(400).json({
        error: "User does not exists",
      });
    }

    const surveysAlreadyExists = await surveysRepository.findOne({
      id: survey_id,
    });

    if (!surveysAlreadyExists) {
      return response.status(400).json({
        error: "Survey does not exists",
      });
    }

    const variables = {
      name: usersAlreadyExists.name,
      title: surveysAlreadyExists.title,
      description: surveysAlreadyExists.description,
      user_id: usersAlreadyExists.id,
      link: process.env.URL_MAIL,
    };

    const npsPath = resolve(__dirname, "..", "views", "emails", "npsMail.hbs");

    const surveyUserAlreadyExists = await surveysUsersRepository.findOne({
      where: [{ user_id: usersAlreadyExists.id }, { value: null }],
      relations: ["user", "survey"]
    });

    if (surveyUserAlreadyExists) {
      await SendMailService.execute(
        email,
        surveysAlreadyExists.title,
        variables,
        npsPath
      );
      return response.json(surveyUserAlreadyExists);
    }

    const surveyUser = surveysUsersRepository.create({
      user_id: usersAlreadyExists.id,
      survey_id: surveysAlreadyExists.id,
    });

    await surveysUsersRepository.save(surveyUser);

    await SendMailService.execute(
      email,
      surveysAlreadyExists.title,
      variables,
      npsPath
    );

    return response.json(surveyUser);
  }
}

export { SendMailController };