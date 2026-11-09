import { test,expect,type Page,type APIRequestContext } from '@playwright/test';
const path='/services/web-development';
async function captcha(page:Page){await page.addInitScript(()=>{window.turnstile={render:(_el,options)=>{setTimeout(()=>{(options.callback as (v:string)=>void)('controlled-browser-test');},0);return 'fixture';},remove:()=>{}};});await page.route('https://challenges.cloudflare.com/turnstile/**',r=>r.fulfill({contentType:'application/javascript',body:''}));}
async function publicFixture(page:Page,request:APIRequestContext){
 const counts={google:0,clarity:0},events:Record<string,unknown>[]=[];
 await page.route('https://www.shaunmathiasz.com/**',async route=>{const u=new URL(route.request().url());if(u.pathname==='/api/digital/events'){events.push(route.request().postDataJSON());return route.fulfill({json:{recorded:true}});}const r=await request.fetch((process.env.PLAYWRIGHT_BASE_URL||'http://127.0.0.1:3060')+u.pathname+u.search,{method:route.request().method(),headers:route.request().headers(),data:route.request().postDataBuffer()||undefined});await route.fulfill({response:r}).catch(e=>{if(!String(e).includes('already handled'))throw e;});});
 await page.route('https://www.googletagmanager.com/gtm.js**',r=>{counts.google++;return r.fulfill({contentType:'application/javascript',body:'window.__digitalMockGoogle=true;'});});
 await page.route('https://www.clarity.ms/tag/**',r=>{counts.clarity++;return r.fulfill({contentType:'application/javascript',body:'window.clarity=(...args)=>{};'});});return{counts,events};
}
test.afterEach(async({page})=>page.unrouteAll({behavior:'ignoreErrors'}));
test('services prices, supplied logos, metadata and responsive concepts',async({page,request})=>{
 const r=await request.get(path);const html=await r.text();expect(html).toContain('LKR 24,900');expect(html).toContain('LKR 59,900');expect(html).toContain('LKR 119,900');expect(html).not.toContain('<s>');
 await page.goto(path);await expect(page.locator('h1')).toHaveText('Your BusinessDeserves aBrilliant Website.');
 for(const width of [360,390,768,1024,1440]){await page.setViewportSize({width,height:900});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),String(width)).toBe(true);}
 await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href','https://www.shaunmathiasz.com'+path);
 const logo=page.getByAltText('SDM Digital — website development services by Shaun Denver Mathiasz');await expect(logo).toBeVisible();expect(await logo.evaluate((el:HTMLImageElement)=>el.naturalWidth>0)).toBe(true);
 await page.getByRole('button',{name:'Full Comparison',exact:true}).click();await expect(page.getByRole('button',{name:'Essential Features',exact:true})).toHaveAttribute('aria-expanded','true');
 await page.getByRole('button',{name:'Guesthouses',exact:true}).click();await expect(page.getByRole('heading',{name:'A warmer welcome, online.'})).toBeVisible();
 await page.getByRole('button',{name:'Mobile',exact:true}).click();await expect(page.locator('.digital-device-mobile')).toBeVisible();
 await page.getByRole('button',{name:/03.*Design/}).click();await expect(page.locator('.digital-process-detail')).toContainText('brand-tailored direction');
 const image=await request.get('/social/sdm-digital-services.jpg');expect(image.status()).toBe(200);expect(image.headers()['content-type']).toContain('image/jpeg');
});
test('package selection preserves fields and server-confirmed success is required',async({page})=>{
 await captcha(page);await page.goto(path);await page.getByRole('button',{name:'Choose Starter Presence',exact:true}).click();await expect(page.locator('#digital-fullName')).toBeFocused();
 await page.locator('#digital-fullName').fill('Browser Test Owner');await page.locator('#digital-businessName').fill('Example Villa');
 await page.getByRole('button',{name:'Choose Business Growth',exact:true}).click();await expect(page.locator('#digital-fullName')).toHaveValue('Browser Test Owner');await expect(page.locator('.digital-form-summary')).toContainText('Business Growth');
 await page.locator('select[name="businessCategory"]').selectOption('Hospitality');await page.locator('#digital-email').fill('browser@example.test');await page.locator('#digital-phone').fill('+94 77 123 4567');await page.locator('textarea[name="projectDescription"]').fill('A useful direct enquiry website for our villa business.');await page.locator('input[name="consent"]').check();
 let submissions=0;await page.route('**/api/digital/enquiry',async r=>{submissions++;await r.fulfill({status:503,json:{error:'Controlled service failure'}});});
 await page.getByRole('button',{name:'Let’s discuss your project'}).click();await expect(page.locator('.digital-form [role="alert"]')).toContainText('Controlled service failure');expect(await page.getByText('ENQUIRY RECEIVED',{exact:true}).count()).toBe(0);
 await page.unroute('**/api/digital/enquiry');await page.route('**/api/digital/enquiry',r=>{submissions++;const data=r.request().postDataJSON();expect(data.selectedPackage).toBe('growth');return r.fulfill({status:201,json:{reference:'SDM-BROWSER-TEST',created:true}});});
 await page.getByRole('button',{name:'Let’s discuss your project'}).click();await expect(page.getByRole('status')).toContainText('SDM-BROWSER-TEST');expect(submissions).toBe(2);
});
test('invalid form focuses errors and public API rejects unsafe requests',async({page,request})=>{
 await captcha(page);await page.goto(path);await page.getByRole('button',{name:'Let’s discuss your project'}).click();await expect(page.locator('#digital-fullName')).toHaveAttribute('aria-invalid','true');await expect(page.locator('#digital-fullName')).toBeFocused();
 const origin=process.env.PLAYWRIGHT_BASE_URL||'http://127.0.0.1:3060';
 expect((await request.post('/api/digital/enquiry',{headers:{Origin:'https://untrusted.example'},data:{}})).status()).toBe(403);
 expect((await request.post('/api/digital/enquiry',{headers:{Origin:origin},data:{large:'x'.repeat(13000)}})).status()).toBe(413);
 expect((await request.post('/api/digital/events',{headers:{Origin:origin},data:{eventId:crypto.randomUUID(),name:'generate_lead',consent:true,email:'private@example.test'}})).status()).toBe(400);
 for(const url of ['/api/admin/digital-solutions','/api/admin/digital-solutions/export'])expect((await request.post(url,{headers:{Origin:origin},data:{}})).status()).toBe(401);
 const admin=await request.get('/admin/digital-solutions');expect(admin.url()).toContain('/admin/login');
});
test('services vendor scripts require the newly disclosed commercial consent',async({page,request})=>{
 const{counts,events}=await publicFixture(page,request);await page.addInitScript(()=>localStorage.setItem('sdm-analytics-consent-v2',JSON.stringify({version:1,choice:'accepted',at:Date.now()})));
 await page.goto('https://www.shaunmathiasz.com'+path);await expect(page.getByRole('heading',{name:'Optional analytics.'})).toBeVisible();expect(counts).toEqual({google:0,clarity:0});expect(events).toHaveLength(0);
 await expect(page.getByText(/automatically detect contact details/)).toBeVisible();await page.getByRole('button',{name:'Allow analytics',exact:true}).click();await expect.poll(()=>counts.google).toBe(1);await expect.poll(()=>counts.clarity).toBe(1);await expect.poll(()=>events.filter(e=>e.name==='digital_services_page_view').length).toBe(1);
 await page.getByRole('button',{name:'Choose Starter Presence',exact:true}).click();await page.locator('#digital-fullName').fill('Do Not Put This In Events');await page.locator('#digital-email').fill('private-browser@example.test');await expect.poll(()=>events.filter(e=>e.name==='package_selected').length).toBe(1);
 expect(JSON.stringify(events)).not.toMatch(/Do Not Put|private-browser|fullName|reference|projectDescription/);
 const queued=await page.evaluate(()=>window.dataLayer);expect(JSON.stringify(queued)).not.toContain('private-browser@example.test');
 await page.locator('footer a[href="/request-cv"]').click();await expect(page.getByRole('heading',{name:'REQUEST MY CV',exact:true})).toBeVisible();expect(await page.evaluate(()=>!!window.__sdmGtmStarted||!!window.clarity)).toBe(false);
});
test('reduced motion retains the offer and keyboard controls',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto(path);await page.getByRole('button',{name:'Full Comparison',exact:true}).focus();await page.keyboard.press('Enter');await expect(page.getByRole('button',{name:'Essential Features',exact:true})).toHaveAttribute('aria-expanded','true');expect(await page.locator('.digital-hero-content').evaluate(el=>getComputedStyle(el).animationName)).toBe('none');
});
