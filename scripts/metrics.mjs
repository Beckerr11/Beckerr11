import { mkdir, writeFile } from 'node:fs/promises';
const user = 'Beckerr11';
const token = process.env.METRICS_TOKEN || process.env.GITHUB_TOKEN;
if (!token) throw new Error('A GitHub read credential is required.');
const headers = { Authorization: `Bearer ${token}`, 'User-Agent': 'Becker-profile-metrics', Accept: 'application/vnd.github+json' };
async function graphql(query, variables = {}) {
  const res = await fetch('https://api.github.com/graphql', { method: 'POST', headers, body: JSON.stringify({ query, variables }) });
  const body = await res.json();
  if (!res.ok || body.errors?.length) throw new Error(JSON.stringify(body.errors || {status:res.status}));
  return body.data;
}
const { user: account, viewer } = await graphql(`query($login:String!){viewer{login} user(login:$login){createdAt followers{totalCount} following{totalCount} repositories(first:100,ownerAffiliations:OWNER){totalCount nodes{isPrivate stargazerCount}} pullRequests{totalCount} opened:pullRequests(states:OPEN){totalCount} merged:pullRequests(states:MERGED){totalCount} closed:pullRequests(states:CLOSED){totalCount} issues{totalCount} recent:pullRequests(first:30,orderBy:{field:UPDATED_AT,direction:DESC}){nodes{title url updatedAt state repository{nameWithOwner isPrivate}}}}}`, {login:user});
const authenticatedOwner = viewer.login.toLowerCase() === user.toLowerCase();
if (process.env.REQUIRE_OWNER === 'true' && !authenticatedOwner) throw new Error('Owner-scoped data is required; refusing to overwrite complete metrics with public-only totals.');
if (account.repositories.totalCount > account.repositories.nodes.length) throw new Error('Repository pagination required before computing totals.');
const now = new Date();
const years = Array.from({length:now.getUTCFullYear()-new Date(account.createdAt).getUTCFullYear()+1},(_,i)=>new Date(account.createdAt).getUTCFullYear()+i);
const yearly = await Promise.all(years.map(async year => {
  const from = `${year}-01-01T00:00:00Z`;
  const to = year===now.getUTCFullYear()?now.toISOString():`${year}-12-31T23:59:59Z`;
  const data = await graphql(`query($login:String!,$from:DateTime!,$to:DateTime!){user(login:$login){contributionsCollection(from:$from,to:$to){totalCommitContributions totalPullRequestReviewContributions restrictedContributionsCount contributionCalendar{totalContributions}}}}`,{login:user,from,to});
  return data.user.contributionsCollection;
}));
const sum = key => yearly.reduce((n,y)=>n+y[key],0);
const metrics = {
  scope:authenticatedOwner?'account':'public', since:account.createdAt.slice(0,10),
  prs:account.pullRequests.totalCount, prsOpen:account.opened.totalCount, prsMerged:account.merged.totalCount, prsClosed:account.closed.totalCount,
  issues:account.issues.totalCount, repositories:account.repositories.totalCount,
  publicRepositories:account.repositories.nodes.filter(r=>!r.isPrivate).length,
  privateRepositories:account.repositories.nodes.filter(r=>r.isPrivate).length,
  stars:account.repositories.nodes.reduce((n,r)=>n+r.stargazerCount,0), followers:account.followers.totalCount, following:account.following.totalCount,
  commits:sum('totalCommitContributions'), reviews:sum('totalPullRequestReviewContributions'), contributions:yearly.reduce((n,y)=>n+y.contributionCalendar.totalContributions,0), restrictedContributions:sum('restrictedContributionsCount'),
};
if (metrics.prs !== metrics.prsOpen+metrics.prsMerged+metrics.prsClosed) throw new Error('PR state totals disagree.');
if (metrics.repositories !== metrics.publicRepositories+metrics.privateRepositories) throw new Error('Repository totals disagree.');
const esc = s => String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
const stamp = now.toISOString().slice(0,19).replace('T',' ')+' UTC';
const scope = authenticatedOwner?'Public + private aggregates':'Public data only';
const shell = (title,height,body) => `<svg xmlns="http://www.w3.org/2000/svg" width="960" height="${height}" viewBox="0 0 960 ${height}" role="img"><title>${esc(title)}</title><rect x="1" y="1" width="958" height="${height-2}" rx="18" fill="#0d1117" stroke="#25332d"/><style>text{font-family:ui-monospace,SFMono-Regular,Consolas,monospace}.muted{fill:#a6b7ad;font-size:11px}.label{fill:#79e6b3;font-size:12px;letter-spacing:1px}</style>${body}<text x="30" y="${height-19}" class="muted">${esc(scope)} · Updated ${stamp}</text></svg>`;
const highlights=[['CONTRIBUTIONS',metrics.contributions],['PULL REQUESTS',metrics.prs],['MERGED PRS',metrics.prsMerged],['PROFILE COMMITS',metrics.commits],['REPOSITORIES',metrics.repositories],['ISSUES CREATED',metrics.issues]];
const number = n => n.toLocaleString('en-US');
const overview=shell('Becker / GitHub at a glance',270,`<text x="30" y="30" class="label">BECKER / AT A GLANCE</text>`+highlights.map(([label,n],i)=>{const x=30+(i%3)*313,y=88+Math.floor(i/3)*101;return `<text x="${x}" y="${y}" fill="#edf5ef" font-size="38" font-weight="700">${number(n)}</text><text x="${x}" y="${y+23}" class="label">${label}</text>`;}).join(''));
const stats=[['PULL REQUESTS',metrics.prs],['MERGED PRS',metrics.prsMerged],['OPEN PRS',metrics.prsOpen],['CLOSED PRS',metrics.prsClosed],['PROFILE COMMITS',metrics.commits],['CONTRIBUTIONS',metrics.contributions],['ISSUES CREATED',metrics.issues],['PROFILE REVIEWS',metrics.reviews],['PUBLIC REPOS',metrics.publicRepositories],['PRIVATE REPOS',metrics.privateRepositories],['TOTAL REPOS',metrics.repositories],['PRIVATE CONTRIBUTIONS',metrics.restrictedContributions],['STARS RECEIVED',metrics.stars],['FOLLOWERS',metrics.followers],['FOLLOWING',metrics.following],['CALENDAR YEARS',years.length]];
const details=shell('Becker / Detailed account statistics',390,`<text x="30" y="30" class="label">ACCOUNT DETAILS / SINCE ${metrics.since}</text>`+stats.map(([label,n],i)=>{const x=30+(i%4)*235,y=79+Math.floor(i/4)*84;return `<text x="${x}" y="${y}" fill="#edf5ef" font-size="27" font-weight="700">${number(n)}</text><text x="${x}" y="${y+20}" fill="#79e6b3" font-size="10">${label}</text>`;}).join(''));
const recent=account.recent.nodes.filter(p=>!p.repository.isPrivate).slice(0,4);
const state={OPEN:'open',MERGED:'merged',CLOSED:'closed'};
const activity=shell('Becker / Recent public pull requests',220,`<text x="30" y="30" class="label">RECENT PUBLIC PULL REQUESTS</text>`+recent.map((p,i)=>{const y=65+i*34;return `<circle cx="34" cy="${y-4}" r="4" fill="#79e6b3"/><text x="50" y="${y}" fill="#edf5ef" font-size="13">${esc(p.repository.nameWithOwner.slice(0,51))} · ${state[p.state]}</text><text x="920" y="${y}" text-anchor="end" class="muted">${p.updatedAt.slice(0,10)}</text>`;}).join(''));
await mkdir('assets',{recursive:true});
await writeFile('assets/github-overview.svg',overview);
await writeFile('assets/github-details.svg',details);
await writeFile('assets/github-activity.svg',activity);
await writeFile('assets/metrics.json',JSON.stringify({...metrics,updatedAt:now.toISOString()},null,2)+'\n');
console.log(JSON.stringify(metrics));
