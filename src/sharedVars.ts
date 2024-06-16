let basePath = process.cwd();

const getBasePath = (): string => basePath;
const setBasePath = (value: string) => {
  basePath = value;
};

const sharedVars = {
  getBasePath,
  setBasePath,
};
export default sharedVars;
