export type SiteConfig = {
    name:string,
    description:string,
    url:string,
    ogImage:string,
    links:{
        x:string;
        github:string;
    };
};
export interface CustomError extends Error {
  cause?: {
    err?: Error;
  };
}