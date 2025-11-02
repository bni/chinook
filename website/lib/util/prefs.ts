import { getIronSession, IronSession, SessionOptions } from "iron-session";
import { secret } from "@lib/util/secrets";
import { IncomingMessage, ServerResponse } from "node:http";

interface Prefs {
  fromYear: number;
  toYear: number;
  pageSize: number;
}

const securePrefix = process.env.NODE_ENV !== "development" ? "__Secure-" : "";
const cookieName = "chinook.user_prefs";

const options: SessionOptions = {
  password: await secret("IRON_SESSION_SECRET"),
  cookieName: `${securePrefix}${cookieName}`,
  ttl: 0, // Will result in maximum allowed
  cookieOptions: {
    secure: process.env.NODE_ENV !== "development",
    sameSite: "strict"
  }
};

const getPrefs = async (req: IncomingMessage, res: ServerResponse): Promise<IronSession<Prefs>> => {
  return await getIronSession<Prefs>(req, res, options);
};

const savePrefs = async (prefs: IronSession<Prefs>): Promise<void> => {
  await prefs.save();
};

export { getPrefs, savePrefs };
