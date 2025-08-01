import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'

export default function HomePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">LaunchRadar</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Personal business intelligence tool for identifying and tracking micro-SaaS opportunities
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Data Collection</CardTitle>
            <CardDescription>
              Automated monitoring of Twitter and Reddit for opportunity signals
            </CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Intelligent Scoring</CardTitle>
            <CardDescription>
              AI-powered scoring system to prioritize the most promising opportunities
            </CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Personal Dashboard</CardTitle>
            <CardDescription>
              Personalized interface for tracking and managing your research
            </CardDescription>
          </CardHeader>
        </Card>
      </div>

      <div className="text-center">
        <Link href="/login">
          <Button size="lg">
            Get Started
          </Button>
        </Link>
      </div>

      <div className="mt-16 text-center text-sm text-muted-foreground">
        <p>Personal Research Tool | Budget: &lt;56€/month | Built for Individual Use</p>
      </div>
    </div>
  )
}