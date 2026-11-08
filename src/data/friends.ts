export interface FriendSite {
  name: string;
  url: string;
  description: string;
  monogram: string;
  example?: boolean;
}

// 将示例替换为正式友链，或按相同格式继续添加。
export const friendSites: FriendSite[] = [
  {
    name: '朝朝听雨',
    url: 'https://rainzt.cn/',
    description: '开发、写作与记录',
    monogram: '雨',
    example: true,
  },
];

export const thisSite = {
  name: "iqwqi's world",
  url: 'https://iqwqi.win/',
  avatar: 'https://iqwqi.win/generated/site/avatar-160.webp',
};
