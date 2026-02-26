from playwright.sync_api import Page, expect, sync_playwright
import time

def test_jules_features(page: Page):
    # 1. Arrange: Go to the app.
    page.goto("http://localhost:3000")

    # Wait for the view to render
    expect(page.get_by_role("heading", name="Tasks")).to_be_visible()

    # 2. Assert (List View):
    # - "Open Task" should be visible
    expect(page.get_by_text("Open Task")).to_be_visible()

    # - "Jules Task (Active with PR)" should NOT be visible (because status is active)
    # Note: "Jules Task (Active with PR)" has status "active", so it should be filtered out from List view.
    expect(page.get_by_text("Jules Task (Active with PR)")).not_to_be_visible()

    # - "Active Task (No PR)" should NOT be visible (active status)
    expect(page.get_by_text("Active Task (No PR)")).not_to_be_visible()

    # - "Closed Task" should NOT be visible (closed status)
    expect(page.get_by_text("Closed Task")).not_to_be_visible()

    # 3. Act: Switch to Jules Tab
    page.get_by_role("button", name="Jules", exact=True).click()

    # 4. Assert (Jules View):
    # - "Jules Task (Active with PR)" SHOULD be visible (has active session & PR link)
    expect(page.get_by_text("Jules Task (Active with PR)")).to_be_visible()

    # - "Active Task (No PR)" should NOT be visible (no PR link yet)
    expect(page.get_by_text("Active Task (No PR)")).not_to_be_visible()

    # - Check for PR Link
    expect(page.get_by_role("link", name="Pull Request")).to_be_visible()

    # 5. Screenshot
    page.screenshot(path="verification.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            test_jules_features(page)
            print("Verification successful!")
        except Exception as e:
            print(f"Verification failed: {e}")
            page.screenshot(path="failure.png")
            raise e
        finally:
            browser.close()
