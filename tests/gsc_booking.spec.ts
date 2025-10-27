import {test, expect} from '@playwright/test'

test('should navigate and click Buy Now for a movie on GSC', async ({ page }) => {
    // 1. Navigate to the GSC website

    await page.setViewportSize({ width: 1920, height: 1080 });
    //Start fast by blocking resources (Optional, but recommended for speed)
    await page.route('**/*', (route) => {
        const blockedTypes = ['image', 'font', 'media', 'stylesheet', 'other'];
        if (blockedTypes.includes(route.request().resourceType())) {
            route.abort();
        } else {
            route.continue();
        }
    });

    // 1. Navigate to Homepage quickly
    await page.goto('/', { 
        waitUntil: 'domcontentloaded' // Fast navigation to the root page
    });

    // 2. Click the Movies link
    await page.locator('#navbarCollapse').getByRole('link', { name: 'Movies' }).click();
    //await page.waitForLoadState('networkidle'); 
    
    console.log(`Movies page fully loaded. Current URL: ${page.url()}`);

    // Crucially, wait for the new page/tab to open before proceeding
    const [newPage] = await Promise.all([
        page.context().waitForEvent('page'), // Waits for the context to signal a new page opened
        
        // Trigger the action that opens the new tab
        await page.getByRole('link', { name: 'Buy Now' }).nth(2).click() 
        
    ]);

    //await newPage.setViewportSize({ width: 1080, height: 1080 })
    // newPage now holds the reference to the newly opened tab (the booking page)
    console.log(`New tab opened with URL: ${newPage.url()}`);
    
    // Use bringToFront() on the original 'page' object
    //await page.bringToFront();

    // 1. Define the locator for Selecting Date using the XPath 
    const dateSelectionButton = newPage.locator('//div/app-showtime-by-movies/div/section[2]/div/app-movie-operation-dates/div/button[2]');

    //console.log(`Element is now in view. Text content: ${await dateSelectionButton.getAttribute('id')}`);
    await dateSelectionButton.click();

    // 2.  Define the locator for Selecting Experience using the XPath 
    const experienceSelectionButton = newPage.locator('//div/app-showtime-by-movies/div/section[2]/div/div/div[1]');
    console.log(`Element is now in view. Text content: ${await experienceSelectionButton.textContent()}`);
    await experienceSelectionButton.click();

    // 3. Define the locator for Selecting Cinema & Time using the XPath
    const showTimeSelectionButton = newPage.locator('//div/div/mat-accordion/mat-expansion-panel[6]/div/div/app-showtimes/div/div[1]');
    console.log(`Element is now in view. Text content: ${await showTimeSelectionButton.textContent()}`);
    await showTimeSelectionButton.click();

    // Assuming 'newPage' is the active reference to the booking page where the modal appears
    const RATING_TEXT = "THE MOVIE IS RATED FOR AUDIENCES 18 AND ABOVE";
    const PROCEED_BUTTON_TEXT = 'PROCEED';

    // 1. Locate the modal container or the warning text first for context (Optional but safer)
    // We look for the main text in the modal to confirm we have the right one.
    const ratingModalContainer = newPage.locator('mat-dialog-container', { 
        hasText: RATING_TEXT
    });
    const isRatingModalVisible = await ratingModalContainer.isVisible({ timeout: 5000 });

    // --- Conditional Logic ---
    if (isRatingModalVisible) {
    console.log(`Movie is 18+. Handling rating confirmation.`);
    
    // 2. Locate the PROCEED button *inside* that modal container
    const proceedButton = ratingModalContainer.getByRole('button', { name: PROCEED_BUTTON_TEXT });

    // 3. Ensure it's visible and click it
    // No need for a long waitFor here; if the container is visible, the button should be too.
    await proceedButton.click();

    console.log("Successfully clicked PROCEED on the 18+ rating modal.");
    console.log("Successfully clicked PROCEED.");
    
    } else {
        console.log("Movie is not 18+ or dialog did not appear. Continuing booking process.");
        // Script will continue here automatically.
    }       

    await newPage.locator('#phoneNo').fill('xxx'); //Enter your phone number
    await newPage.locator('#password').fill('xxx'); //Enter your password
    await newPage.getByRole('button', { name: 'Login' }).click();

    //Selecting seat
    const seatBooked = newPage.getByAltText('occupied');
    const seatRepaired = newPage.getByAltText('repair')
    const seatSelected = newPage.locator('drag-scroll').getByText('A04')

    const confirmationPrice = newPage.locator('/html/body/app-root/div/app-content-layout/mat-sidenav-container/mat-sidenav-content/div/app-seat-selection/div/div[4]');
    const confirmButton = newPage.getByText(/Confirm/i);



    await seatSelected.click();     
    await confirmButton.click();

    await newPage.getByRole('button', { name: 'RM' }).click();

    //At this line, it will trigger the timer so comment it out 
    //Take note,I'm still working on cleaning it up
    //await newPage.getByRole('button', { name: 'RM' }).click();


    const [paymentPage] = await Promise.all([
        newPage.context().waitForEvent('page'), // Waits for the context to signal a new page opened
        
        // Trigger the action that opens the new tab
         
        await newPage.getByRole('button', { name: /Checkout & Pay/i }).click()
        
    ]);

    await newPage.bringToFront();
    await newPage.getByRole('button', { name: /Reset/i }).click();

    const actualTabName = await page.title();

    console.log(`The actual GSC PAYALL tab name is: ${actualTabName}`);

    // 2. Assert the tab name matches the exact expected string
    const expectedTabName = 'GSC Cinemas Movie Showtimes | Showing Now & Upcoming Movies';

    await expect(page).toHaveTitle(expectedTabName);

    console.log(`Assertion successful: Tab name matches "${expectedTabName}"`);

    await newPage.getByRole('button', { name: 'Yes' }).click();

    
});