export type SpaceStatusType = "in use" | "available" | "on hold" | undefined;

export interface StatusButtonType {
  name: SpaceStatusType;
  icon: React.JSX.Element;
  color: string;
}
