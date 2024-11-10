export interface ExpandedSpaces {
  [key: string]: boolean;
}

export interface EditingCommunity {
  spaceId: string;
  communityId: string;
}

export interface MoveModal {
  spaceId: string;
  communityId: string;
}

export interface Community {
  id: string;
  name: string;
}

export interface Space {
  id: string;
  icon: JSX.Element;
  name: string;
  color: string;
  communities: Community[];
  lastModifiedBy: string;
  lastModifiedAt: Date;
}
