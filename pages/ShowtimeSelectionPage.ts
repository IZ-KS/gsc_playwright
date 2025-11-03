// pages/ShowtimeSelectionPage.ts
import { Page, expect } from '@playwright/test';

export class ShowtimeSelectionPage {
    readonly RATING_TEXT = "THE MOVIE IS RATED FOR AUDIENCES 18 AND ABOVE";
    readonly PROCEED_BUTTON_TEXT = 'PROCEED';
    readonly page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    // Locator for date selection buttons (e.g., SAT 25 Oct)
    getDateSelectionButton(dayText: string) {
        // Example: If you need to find 'SAT 25 Oct' specifically
       return this.page.locator('//div/app-showtime-by-movies/div/section[2]/div/app-movie-operation-dates/div/button[2]');
        //return this.page.locator(`//div/app-showtime-by-movies/div/section[2]/div/app-movie-operation-dates/div/*[contains(text(), "${dayText}")]`);
    }
    
    // Locator for expanding the Cinema & Time section (based on your XPath: [5])
    getCinemaTimePanel() {
        return this.page.locator('//div/div/mat-accordion/mat-expansion-panel[5]/div/div/app-showtimes/div/div[1]');
    }

    // --- Core Action Method: Handle Age Gate ---
    async handleRatingConfirmation() {
        const ratingModalContainer = this.page.locator('mat-dialog-container', { 
            hasText: this.RATING_TEXT
        });

        const isRatingModalVisible = await ratingModalContainer.isVisible({ timeout: 5000 }); 

        if (isRatingModalVisible) {
            console.log(`Movie is 18+. Handling rating confirmation.`);
            
            const proceedButton = ratingModalContainer.getByRole('button', { name: this.PROCEED_BUTTON_TEXT });
            
            await proceedButton.click();
            console.log("Successfully clicked PROCEED.");
            
            // Wait for the page to settle after proceeding
            await this.page.waitForLoadState('networkidle');
        } else {
            console.log("Movie is not 18+ or dialog did not appear.");
        }
    }

    // --- Core Action Method: Select Date and Time ---
    async selectShowtime(dateKey: string, showtime: string) {
        // 1. Select Date (e.g., '26 Oct')
        const dateButton = this.getDateSelectionButton(dateKey);
        await dateButton.click();
        
        // 2. Expand the correct cinema panel
        await this.getCinemaTimePanel().click();
        
        // 3. Handle the 18+ modal if it pops up after clicking a showtime
        await this.handleRatingConfirmation(); 
        
        // 4. Click the specific showtime (You will need a robust locator for the time slot)
        // Example placeholder:
        // await this.page.locator(`text=${showtime}`).click();
    }
}