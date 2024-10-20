function generateRandomString(length) {
  const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;}
  
describe('Yuzee SignUp', () => {
  
  const serverID = "SERVERID";
  const emailDomain = `@${serverID}.mailosaur.net`;
  
  const randomString = generateRandomString(4);
  let emailAddress = `ada${randomString}${emailDomain}`;
  
  it('Should open the signup popup', () => {
    cy.visit('https://dev.yuzee.click/');
    cy.intercept('POST', 'https://auth.yuzee.click/users/api/v1/public/users/signup').as('signupRequest');
    cy.get('button:contains("Join Yuzee")').first().click(); // Adjusted to match the button text
    cy.get('.modal-content').should('be.visible'); // Assuming the popup uses .modal-content
    // Fill out the signup form
  cy.get('input[formcontrolname="firstName"]').type('John');
  cy.get('input[formcontrolname="lastName"]').type('Doe');

  // Generate random email
  cy.get('input[formcontrolname="email"]').type(emailAddress); 

  // Set password and confirm password
  cy.get('input[formcontrolname="password"]').type('Test@12345');
  cy.get('input[formcontrolname="confirmPassword"]').type('Test@12345');

  // Fill in Date of Birth (e.g., 01/01/1990)
  // Set Date of Birth using the date picker
  cy.get('input[placeholder="Date of Birth"]').click(); // Opens the date picker
  // Select Month
  cy.get('select[aria-label="Select month"]').select('Jan'); // Change to the desired month abbreviation

  // Select Year
  cy.get('select[aria-label="Select year"]').select('1990'); // Change to the desired year

  // Select Day
  cy.get('.ngb-dp-day').contains('1').click(); // Change '1' to the desired day

  // Select gender from the dropdown
  cy.get('ng-select[formcontrolname="gender"]').click(); // Opens the dropdown
  cy.get('.ng-option-label:contains("Male")').click(); // Select 'Male'

  // Fill Postal Code
  cy.get('input[formcontrolname="postal_code"]').type('3444');
  cy.get('button.btn.btn-blue.theme-btn.w-50').click();

  // Wait for the verification email from Mailosaur
  cy.wait(2000); // Optional: wait a moment for the email to send (adjust if necessary)
  
  cy.wait('@signupRequest', { timeout: 10000 }).then((interception) => {

    let statusCode = interception.response.statusCode;
    cy.wrap(emailAddress).as('emailAddress');
    cy.get('@emailAddress').then((emailAddress) => {

        if (statusCode === 200) {
            cy.mailosaurGetMessage(serverID, {
                sentTo: emailAddress
            }).then(email => { 
                expect(email.to[0].email).to.equal(emailAddress);
            });
        }
      });
        
    });
    cy.wrap(emailAddress).as('emailAddress');
    cy.get('@emailAddress').then((emailAddress) => {
      cy.mailosaurGetMessage(serverID, {
          sentTo: emailAddress 
      })
      .then(email => {
          const OTP = email.html.codes.map(code => code.value);
    
          for (let i = 1; i <= 6; i++) {
          cy.get(`input[formcontrolname="digit${i}"]`).type(`${OTP[i - 1]}`)
          }
      })
    });
  });
});

  
  


  
