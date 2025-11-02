import { getIronSession, IronSession, SessionOptions } from "iron-session";
import { secret } from "@lib/util/secrets";
import { IncomingMessage, ServerResponse } from "node:http";

interface Prefs {
  fromYear: number;
  toYear: number;
}

const options: SessionOptions = {
  password: await secret("IRON_SESSION_SECRET"),
  cookieName: "chinook.user_prefs",
  cookieOptions: {
    secure: process.env.NODE_ENV !== "development"
  }
};

const getPrefs = async (req: IncomingMessage, res: ServerResponse): Promise<IronSession<Prefs>> => {
  return await getIronSession<Prefs>(req, res, options);
};

const savePrefs = async (prefs: IronSession<Prefs>): Promise<void> => {
  await prefs.save();
};

export { getPrefs, savePrefs };
