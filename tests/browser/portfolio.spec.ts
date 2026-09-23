import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
for(const [name,width,height] of [['desktop',1440,1000],['notebook',1280,800],['tablet',768,1024],['mobile',390,844]] as const){
 test(`${name}: full page, anchors and overflow`,async({page})=>{
  await page.setViewportSize({width,height});const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('/');await expect(page.locator('h1')).toContainText('Felipe Macedo');
  for(const id of ['value','work','open-speech-bridge','database-radar','rizoma','legacy-flight-recorder','journey','education','direction','contact']){
   await page.locator(`#${id}`).scrollIntoViewIfNeeded();
   expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();
  }
  await expect(page.locator('.credential')).toHaveCount(8);
  await page.screenshot({path:`test-results/${name}-full.png`,fullPage:true});
  expect(errors).toEqual([]);
 });
}
test('keyboard, reduced motion and language continuity',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/');await page.keyboard.press('Tab');await expect(page.locator('.skip')).toBeFocused();await page.keyboard.press('Enter');await expect(page).toHaveURL(/#main$/);
 await expect(page.locator('html')).toHaveAttribute('data-motion','reduced');await expect(page.locator('#motion-toggle')).toHaveAttribute('aria-pressed','true');
 await page.locator('header a[href="#education"]').click();await expect(page).toHaveURL(/#education$/);
 await page.locator('.languages a[lang="en"]').click();await expect(page).toHaveURL(/\/en\/#education$/);await expect(page.locator('html')).toHaveAttribute('lang','en');
 await expect(page.locator('h1')).toContainText('Understand complexity');
 const results=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();expect(results.violations).toEqual([]);
});
test('content and navigation survive JavaScript disabled',async({browser})=>{
 const context=await browser.newContext({javaScriptEnabled:false});const page=await context.newPage();await page.goto('http://localhost:4321/');await expect(page.locator('h1')).toContainText('Felipe Macedo');await expect(page.locator('.credential')).toHaveCount(8);await page.locator('header a[href="#contact"]').click();await expect(page).toHaveURL(/#contact$/);await context.close();
});
test('GPU unavailable keeps diagrams and content usable',async({page})=>{
 await page.addInitScript(()=>{HTMLCanvasElement.prototype.getContext=()=>null;});await page.goto('/');await page.waitForTimeout(2800);await expect(page.locator('.graphics-canvas')).toHaveCount(0);await expect(page.locator('.topology')).toBeVisible();await expect(page.locator('#work')).toContainText('OpenSpeechBridge');
});
test('default PT accessibility and local requests only',async({page})=>{
 const external:string[]=[];page.on('request',r=>{if(!r.url().startsWith('http://localhost:4321'))external.push(r.url());});await page.goto('/');await page.waitForTimeout(2500);
 const results=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();expect(results.violations).toEqual([]);expect(external).toEqual([]);
});
test('optional terminal uses current source and safe text output',async({page})=>{
 await page.goto('/legacy/');await page.locator('input').fill('projects');await page.keyboard.press('Enter');await expect(page.locator('#output')).toContainText('Rizoma');await page.locator('input').fill('<img src=x onerror=alert(1)>');await page.keyboard.press('Enter');await expect(page.locator('#output img')).toHaveCount(0);
});
