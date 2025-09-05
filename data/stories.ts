export type Story = {
  id: string;
  title: string;
  description: string;
  author?: string;
};

export const stories: Story[] = [
  // Mirror the YouTube videos as stories for the "Podcasts & Stories" view
  ...[
    "-q725mChs48","47doHaQ0mXg","mHeSxHHUQC8","cJF8SpcDr_c","C7m3efp2OU8","5I-6tYGWlsY",
    "aTZ4oYXOMrI","FZKg4CAhVMI","kvMuVHmoqbw","ZB88So1RiAQ","IUSwAjJ4V1E","3vlZXv23IAM",
    "PbuUTLL6y0s","fFlQqRKnVOk","48cSKdwW-B0","V4v_7lqa16s","UMHV81mzCH8","zJ2OIFdaftc",
    "6dc4AdArucQ","L5IJFIW4xkU","oUQKr3SVlsE","kth3wvHE8V8","zY3_FF0oU_Y","kNZWh-E-gx4",
    "AVEVhQYqHpE","64eXBu3AFps","YfxPCmrEdgA","BsJil90NsCY","_J_cuHUZGRU","5fx0Sj-Aa_8",
    "UiO6KWzEApw","wfXbaP0BjD0","hgBdpAx-7h8","BP_26Obnmww","eGFcBzsybWQ","D6lmk_tVEQ8",
    "OyG1YIAq3Lk","jpsPeIXjpk0","2B-dEEZK-gg","6J7X8ykTKPU","57oKs3oRMFA","hOnB6Ppsfhc",
    "_oCJ7UZ5K2c","qrZYteDyZyE","5z-jpBOtZ_M","V6SNC1ajtkY","DLfA6SnjGkQ","2XIi7506umk",
    "Lxb52gZbqHU","m6xz72YkGkA","5gzwhqrpdOI","EyRWCuPaAMU","LKjBzvB0-4c","dga1yEe0LDc",
    "E25_LCgbeGg","l2P6ZA5EU6Y","4PPG7UvB-4c","o_twF9ump1o","vc43S5U8A7w","IGdzXWcFeYo",
    "5y1KGOPGFls","SQEjFj9TfnA","uI9x0_ACfXE","BS-P98cUvaw","cyLvAeGhx-c","mJMjCV3uKpM",
    "gCPB3FOcR_8","deRRodoapkA","XKllcks17GE","rQy3jkEyfJw","kJxnVJ5Isnw","PI3IDdfC1iM",
    "aooiZ1lpyQ0","LcUpBwt59jI","cuu1hVUI1iQ","UCKyu61iXxM","duYXawDMmC0","hszXtwvHlvE",
    "WeE09D_2GwQ","aYRafHFiZz0","Y1830YNCUmI",
  ].map((id) => ({ id: `yt:${id}`, title: `YouTube: ${id}`, description: "Watch on YouTube", author: "YouTube" })),
];
