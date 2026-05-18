import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";

const wechatProvider = {
  id: "wechat",
  name: "WeChat",
  type: "oidc" as const,
  issuer: "https://open.weixin.qq.com",
  clientId: process.env.AUTH_WECHAT_ID || "placeholder",
  clientSecret: process.env.AUTH_WECHAT_SECRET || "placeholder",
  authorization: {
    url: "https://open.weixin.qq.com/connect/qrconnect",
    params: {
      appid: process.env.AUTH_WECHAT_ID || "",
      response_type: "code",
      scope: "snsapi_login",
    },
  },
  token: {
    url: "https://api.weixin.qq.com/sns/oauth2/access_token",
    params: {
      appid: process.env.AUTH_WECHAT_ID || "",
      secret: process.env.AUTH_WECHAT_SECRET || "",
      grant_type: "authorization_code",
    },
    conform(response: Response) {
      return response.json().then((data) => ({
        ...data,
        token_type: "bearer",
      }));
    },
  },
  userinfo: {
    url: "https://api.weixin.qq.com/sns/userinfo",
    async request({ tokens }: { tokens: any }) {
      const url = `https://api.weixin.qq.com/sns/userinfo?access_token=${tokens.access_token}&openid=${tokens.openid}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.errcode) throw new Error(data.errmsg || "WeChat userinfo error");
      return {
        id: data.openid,
        name: data.nickname,
        image: data.headimgurl,
        nickname: data.nickname,
      };
    },
  },
  profile(profile: any) {
    return {
      id: profile.openid || profile.id,
      name: profile.nickname,
      image: profile.headimgurl,
    };
  },
  checks: ["state" as const],
  client: {
    token_endpoint_auth_method: "none" as const,
  },
  style: { brand: "#07c160" },
} as any;

const qqProvider = {
  id: "qq",
  name: "QQ",
  type: "oauth" as const,
  clientId: process.env.AUTH_QQ_ID || "placeholder",
  clientSecret: process.env.AUTH_QQ_SECRET || "placeholder",
  authorization: {
    url: "https://graph.qq.com/oauth2.0/authorize",
    params: {
      response_type: "code",
      scope: "get_user_info",
    },
  },
  token: {
    url: "https://graph.qq.com/oauth2.0/token",
    async conform(response: Response) {
      const text = await response.text();
      const params = new URLSearchParams(text);
      const data: any = {};
      params.forEach((v, k) => (data[k] = v));
      if (data.code) throw new Error(data.msg || "QQ token error");
      return {
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        expires_in: Number(data.expires_in),
        token_type: "bearer",
      };
    },
  },
  userinfo: {
    url: "https://graph.qq.com/oauth2.0/me",
    async request({ tokens }: { tokens: any }) {
      const meUrl = `https://graph.qq.com/oauth2.0/me?access_token=${tokens.access_token}&fmt=json`;
      const meRes = await fetch(meUrl);
      const meData = await meRes.json();
      if (meData.error) throw new Error(meData.error_description || "QQ me error");
      const openid = meData.openid;

      const infoUrl = `https://graph.qq.com/user/get_user_info?access_token=${tokens.access_token}&oauth_consumer_key=${process.env.AUTH_QQ_ID}&openid=${openid}`;
      const infoRes = await fetch(infoUrl);
      const infoData = await infoRes.json();
      if (infoData.ret !== 0) throw new Error(infoData.msg || "QQ userinfo error");

      return {
        id: openid,
        name: infoData.nickname,
        image: infoData.figureurl_qq_2 || infoData.figureurl_qq_1 || infoData.figureurl,
        nickname: infoData.nickname,
        gender: infoData.gender,
      };
    },
  },
  profile(profile: any) {
    return {
      id: profile.openid || profile.id,
      name: profile.nickname,
      image: profile.figureurl_qq_2 || profile.figureurl_qq_1,
    };
  },
  style: { brand: "#12B7F5" },
} as any;

const hasWeChat = !!(process.env.AUTH_WECHAT_ID && process.env.AUTH_WECHAT_SECRET);
const hasQQ = !!(process.env.AUTH_QQ_ID && process.env.AUTH_QQ_SECRET);
const hasGoogle = !!(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET);

const providers: any[] = [Credentials({
  name: "credentials",
  credentials: {
    account: { label: "邮箱/手机号", type: "text" },
    password: { label: "密码", type: "password" },
  },
  async authorize(credentials) {
    if (!credentials?.account || !credentials?.password) return null;
    const account = credentials.account as string;
    const password = credentials.password as string;

    const user = await prisma.user.findFirst({
      where: { OR: [{ email: account }, { phone: account }] },
    });

    if (!user || !user.passwordHash) return null;

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) return null;

    return { id: user.id, name: user.nickname, email: user.email, image: user.avatar };
  },
})];

if (hasGoogle) providers.push(Google({
  clientId: process.env.AUTH_GOOGLE_ID || "",
  clientSecret: process.env.AUTH_GOOGLE_SECRET || "",
}));

if (hasWeChat) providers.push(wechatProvider);
if (hasQQ) providers.push(qqProvider);

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers,
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role || "USER";
      }
      if (account && user) {
        const existingUser = await prisma.user.findUnique({ where: { id: user.id! } });
        if (!existingUser) {
          await prisma.user.create({
            data: {
              id: user.id!,
              nickname: (user as any).nickname || user.name || "用户",
              avatar: user.image,
              role: "USER",
            },
          });
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
      }
      return session;
    },
  },
});
