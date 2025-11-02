import { getIronSession, IronSession, SessionOptions } from "iron-session";
import { secret } from "@lib/util/secrets";
import { IncomingMessage, ServerResponse } from "node:http";

interface Prefs {
  artistsFromYear: number;
  artistsToYear: number;
  artistsPageSize: number;
}

const defaultPrefs: Prefs = {
  artistsFromYear: 1991,
  artistsToYear: 2004,
  artistsPageSize: 20
};

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
  const prefs = await getIronSession<Prefs>(req, res, options);

  // Set default prefs if no value existed
  for (const prop in defaultPrefs) {
    if (!prefs.hasOwnProperty(prop)) {
      // @ts-expect-error We need to set the default values
      prefs[prop] = defaultPrefs[prop];
    }
  }

  return prefs;
};

const savePrefs = async (prefs: IronSession<Prefs>): Promise<void> => {
  await prefs.save();
};

export { getPrefs, savePrefs };
