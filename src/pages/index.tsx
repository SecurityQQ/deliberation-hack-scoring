import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const Schedule = () => {
  return (
    <div className="my-8">
      <h2 className="text-2xl font-bold">Schedule</h2>
      <Accordion type="single" collapsible className="w-full mt-4">

        {/* Tuesday 27th August */}
        <AccordionItem value="item-1">
          <AccordionTrigger>Tuesday 27th August</AccordionTrigger>
          <AccordionContent>
            <ul className="list-disc ml-8">
              <li><strong>12pm kick-off:</strong> Opening remarks & Track announces</li>
              <li><strong>1pm-3pm:</strong> Team Formation + Ideas Pitching
                <ul className="list-disc ml-8 mt-2">
                  <li>Moment to pitch your project that you want to work on</li>
                </ul>
              </li>
              <li><strong>3pm:</strong> Discussion: From 0 to 1
                <ul className="list-disc ml-8 mt-2">
                  <li>We will discuss how to succeed as a startup</li>
                </ul>
              </li>
              <li><strong>4pm – 5pm Mentors Checkpoint</strong>
                <ul className="list-disc ml-8 mt-2">
                  <li>Each person shares their progress and problems</li>
                  <li>Other people try to share their stories of how they solved similar projects</li>
                  <li><strong>Pro-Tip:</strong> prep, ask your team:
                    <ul className="list-disc ml-8 mt-2">
                      <li>What do we want to build?</li>
                      <li>What do we want to achieve this Hackathon?</li>
                      <li>What is our dream outcome?</li>
                    </ul>
                  </li>
                </ul>
              </li>
              <li><strong>4pm:</strong> 🍕 Pizza Break</li>
              <li><strong>24/7 Hacking</strong></li>
            </ul>
          </AccordionContent>
        </AccordionItem>

        {/* Wednesday 28th August */}
        <AccordionItem value="item-2">
          <AccordionTrigger>Wednesday 28th August</AccordionTrigger>
          <AccordionContent>
            <ul className="list-disc ml-8">
              <li><strong>4am:</strong> Extra mile with a RedBull 😈</li>
              <li><strong>11am - 12.30pm Mentorship Session 2:</strong> Progress
                <ul className="list-disc ml-8 mt-2">
                  <li>Talk with your mentors about progress during the hackathon</li>
                  <li><strong>Pro-Tip:</strong> prep, ask your team:
                    <ul className="list-disc ml-8 mt-2">
                      <li>What did we make since the last checkpoint?</li>
                      <li>What do we want to achieve before demo time?</li>
                      <li>What is our dream outcome?</li>
                    </ul>
                  </li>
                </ul>
              </li>
              <li><strong>5pm - 7.30pm</strong> Demo Time
                <ul className="list-disc ml-8 mt-2">
                  <li>Let’s prepare demos together</li>
                   <li><strong>Criteria:</strong></li>
                    <ul className="list-disc ml-8">
                      <li>Technical Completeness (How much did you hack during the hackathon)</li>
                      <li>Technical Perspective (What can you do after hackathon with that demo)</li>
                      <li>Idea (How cool is your idea? Does it match the tracks?)</li>
                      <li>Completeness (How good is your app?)</li>
                      <li>Personal Impression (Do judges like your project?)</li>
                    </ul>
                </ul>
              </li>
              <li><strong>24/7 Hacking</strong></li>
            </ul>
          </AccordionContent>
        </AccordionItem>

        {/* Thursday 29th August */}
        <AccordionItem value="item-3">
          <AccordionTrigger>Thursday 29th August</AccordionTrigger>
          <AccordionContent>
            <ul className="list-disc ml-8">
              <li><strong>Winners Announcement</strong> At Closing Ceremony
              </li>
            </ul>
          </AccordionContent>
        </AccordionItem>

      </Accordion>
    </div>
  );
};

const Home = () => {
  return (
    <div className="container mx-auto p-8">
      {/* Header Section */}
      <Card className="mb-8">
        <CardHeader>
          <h1 className="text-3xl font-bold text-center">ZuVillage Hackathon</h1>
          <p className="text-center italic text-lg">
            Great projects come with great people in a great environment. And YOU are going to prove that!
          </p>
        </CardHeader>
        <CardContent className="flex justify-center my-4">
          <Image
            src="/giphy-3.webp"
            alt="Hackathon gif"
            width={500}
            height={300}
          />
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button>
            <Link href="https://cryptpad.fr/form/#/2/form/view/ylElBnP6jNUvi9z79vG-V6p81Z+UQIJiJQzQgAVuYao/p/" target="_blank">
              Application Form | Pass: sakartvelo
            </Link>
          </Button>
        </CardFooter>
      </Card>

      {/* Tracks Section */}
      <Card className="mb-8">
        <CardHeader>
          <h2 className="text-2xl font-bold">Let’s build together for d/acc in these Tracks:</h2>
        </CardHeader>
        <CardContent>
          <ul className="list-disc ml-8">
            <li>Cognitive Sovereignty</li>
            <li>Artificial Intelligence</li>
            <li>Decentralized Government</li>
            <li>Network States</li>
            <li>Science: Longevity, DeSci, Space</li>
          </ul>
        </CardContent>
      </Card>

      {/* Bounties Section */}
      <Card className="mb-8">
        <CardHeader>
          <h2 className="text-2xl font-bold">Bounties</h2>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center">
            <Image
              src="/panther.png"
              alt="Panther Protocol Logo"
              width={150}
              height={150}
            />
            <h3 className="text-xl font-semibold mt-4">By Panther Protocol</h3>
            <ul className="list-disc ml-8 mt-4">
              <li>$1000 Bounty: The Best Startup Pitch</li>
              <li>$2000: The Best Idea</li>
              <li>$3000: The Best Project Build On The Hackathon</li>
            </ul>
          </div>
          <div className="flex flex-col items-center mt-8">
            <Image
              src="/image.png"
              alt="Zuzalu Logo"
              width={150}
              height={150}
            />
            <h3 className="text-xl font-semibold mt-4">By Zuzalu.City</h3>
            <ul className="list-disc ml-8 mt-4">
              <li>$500 Bounty: “Decentralized Advertisement Banner”</li>
              <li>$500 Bounty: “Web3 Application Form”</li>
            </ul>
          </div>

          <div className="flex flex-col items-center mt-8">
          <p className='mt-4 text-muted-foreground mb-2'>Want to submit your bounty? Easy!</p>
             <Button>
              <Link href="https://t.me/alexvargaxyz" target="_blank">
                Chat With Alex
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Perks Section */}
      <Card className="mb-8">
        <CardHeader>
          <h2 className="text-2xl font-bold">For You</h2>
        </CardHeader>
        <CardContent>
          <ul className="list-disc ml-8">
            <li>🍕 Pizza, ⚡ Snacks For All Attendees</li>
            <li>$7000 in prizes</li>
            <li>Closing Ceremony Party</li>
          </ul>
        </CardContent>
      </Card>

      {/* For ZuVillagers & Frens Section */}
      <Card className="mb-8">
        <CardHeader>
          <h2 className="text-2xl font-bold">For ZuVillagers & Frens</h2>
        </CardHeader>
        <CardContent>
          <p>ZuVillagers, People from Zuzalu, and your friends are invited! For people who want to join online, we will do a broadcast.</p>
          <div className="flex justify-center my-4">
            <Image
              src="/giphy-2.webp"
              alt="Hackathon gif"
              width={500}
              height={300}
            />
          </div>
        </CardContent>
      </Card>

      {/* What Happens Section */}
      <Card className="mb-8">
        <CardHeader>
          <h2 className="text-2xl font-bold">What typically happens at a hackathon?</h2>
        </CardHeader>
        <CardContent>
          <p>After hosting over 50 hacks, we’ve noticed common patterns:</p>
          <ul className="list-disc ml-8">
            <li><strong>Meet cool people:</strong> Collaborate with others who face similar challenges and look for team members.</li>
            <li><strong>Opportunity for non-tech people:</strong> You don’t need to be an engineer to join. People from different domains are welcome.</li>
            <li><strong>Dream project:</strong> Build your dream project, whether it’s a startup, new job, or volunteering.</li>
            <li><strong>Try something new:</strong> Hackathons are a great chance to experiment with new frameworks, technologies, and ideas.</li>
          </ul>
        </CardContent>
      </Card>

      {/* Schedule Section */}
      <Card className="mb-8">
        <CardHeader>
          <h2 className="text-2xl font-bold">Schedule</h2>
        </CardHeader>
        <CardContent>
         <Schedule/>
        </CardContent>
      </Card>

      {/* FAQ Section */}
      <Card className="mb-8">
        <CardHeader>
          <h2 className="text-2xl font-bold">FAQ</h2>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>What is a hackathon?</AccordionTrigger>
              <AccordionContent>
                Hackathon is a 48-hour hacking marathon where people come together to collaborate to solve a problem or identify new opportunities.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>Can I build anything I want?</AccordionTrigger>
              <AccordionContent>
                Yes. Work on your pet project, startup, or work routine. If you want to build a new project, it is recommended to align with ZuVillage principles such as privacy, cognitive sovereignty, and d/acc.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger>Do I need a team?</AccordionTrigger>
              <AccordionContent>
                No, it’s not required, but the best experience is if you have a team of 2 to 5 people.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-4">
              <AccordionTrigger>I don’t have a team, can I join?</AccordionTrigger>
              <AccordionContent>
                Of course! Over 50% of attendees do not have a team.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-5">
              <AccordionTrigger>Can I attend if I miss a hackday?</AccordionTrigger>
              <AccordionContent>
                Yes, sure. Hackathon is a separate event as well!
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-6">
              <AccordionTrigger>Are there any prizes?</AccordionTrigger>
              <AccordionContent>
                Yes, some sponsors will provide cash and other prizes for the best projects. Join our hack days for updates!
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-7">
              <AccordionTrigger>I have more questions</AccordionTrigger>
              <AccordionContent>
                Sure, ask them in our Element group!
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
};

export default Home;
