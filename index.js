const puppeteer = require('puppeteer')

console.clear()

let browser

async function main() {
    browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    let foundAppointments = false
    let i = 0;
    while (true) {
        await page.goto('https://teleservices.paris.fr/rdvtitres/jsp/site/Portal.jsp?page=appointmentsearch&view=search&category=titres');

        await page.waitForSelector('.container-fluid')

        const bodyHandle = await page.$('.nextAvailableAppointments')

        if (bodyHandle) {
            foundAppointments = true

            const res = await page.evaluate(() => {
                const appointementPlace = document.querySelector('h4').innerHTML

                const links = [...document.querySelectorAll('.nextAvailableAppointments a')]

                const calendar = links.pop().href

                const appointments = links.map(link => {
                    return {
                        schedule: link.innerHTML,
                        booking: link.href
                    }
                })

                return { appointementPlace, appointments, calendar }
            }, bodyHandle)

            console.log(`\n----------------------------------\nRendez-vous à [${res.appointementPlace}]`)
            console.log(`Prochain rendez-vous :\n${res.appointments.map(({ schedule, booking }) => `    - ${schedule}\n [${booking}]`).join('\n')}`)
            console.log(`\nCalendrier -> [${res.calendar}]`)
        } else {
            process.stdout.write(`\rWaiting${".".repeat(i)}${" ".repeat(4-i)}`)
            if (i === 4) {
                i = 0;
            }
            i++;

            await new Promise(resolve => setTimeout(resolve, 1000));

        }

        if (foundAppointments) {
            await new Promise((resolve) => setTimeout(resolve, 5000) )
            foundAppointments = false
            console.clear()
        }
    }

    
}

process.on('SIGTERM', async () => {await browser?.close();})
process.on('SIGINT', async () => {await browser?.close();})

main()