// Sample data used when the API is unavailable so the UI still showcases the layout.

export const DEMO_PIPELINES = [
  { id: "pipe-sales", name: "Sales Pipeline" }
];

export const DEMO_STAGES = [
  { id: "stage-new", pipeline_id: "pipe-sales", name: "New", order_index: 0, probability: 0.1 },
  { id: "stage-qualified", pipeline_id: "pipe-sales", name: "Qualified", order_index: 1, probability: 0.3 },
  { id: "stage-proposal", pipeline_id: "pipe-sales", name: "Proposal", order_index: 2, probability: 0.6 },
  { id: "stage-negotiation", pipeline_id: "pipe-sales", name: "Negotiation", order_index: 3, probability: 0.8 },
  { id: "stage-won", pipeline_id: "pipe-sales", name: "Won", order_index: 4, probability: 1 }
];

export const DEMO_DEALS = [
  {
    id: "deal-1",
    name: "Email automation pilot",
    amount: 25000,
    pipeline_id: "pipe-sales",
    pipeline_name: "Sales Pipeline",
    stage_id: "stage-new",
    stage_name: "New",
    company: "Globex Corporation",
    owner: "Ava",
    updated_at: "2024-03-29T10:35:00Z"
  },
  {
    id: "deal-2",
    name: "Website redesign",
    amount: 40000,
    pipeline_id: "pipe-sales",
    pipeline_name: "Sales Pipeline",
    stage_id: "stage-new",
    stage_name: "New",
    company: "Acme Inc.",
    owner: "Ola",
    updated_at: "2024-03-30T09:10:00Z"
  },
  {
    id: "deal-3",
    name: "Field enablement suite",
    amount: 32000,
    pipeline_id: "pipe-sales",
    pipeline_name: "Sales Pipeline",
    stage_id: "stage-qualified",
    stage_name: "Qualified",
    company: "Initech",
    owner: "Jan",
    updated_at: "2024-03-28T14:22:00Z"
  },
  {
    id: "deal-4",
    name: "Predictive dashboards",
    amount: 52000,
    pipeline_id: "pipe-sales",
    pipeline_name: "Sales Pipeline",
    stage_id: "stage-qualified",
    stage_name: "Qualified",
    company: "Stark Industries",
    owner: "Ava",
    updated_at: "2024-03-30T16:48:00Z"
  },
  {
    id: "deal-5",
    name: "Security revamp",
    amount: 66000,
    pipeline_id: "pipe-sales",
    pipeline_name: "Sales Pipeline",
    stage_id: "stage-proposal",
    stage_name: "Proposal",
    company: "Wayne Enterprises",
    owner: "Ola",
    updated_at: "2024-03-28T11:05:00Z"
  },
  {
    id: "deal-6",
    name: "Lifecycle marketing",
    amount: 54000,
    pipeline_id: "pipe-sales",
    pipeline_name: "Sales Pipeline",
    stage_id: "stage-proposal",
    stage_name: "Proposal",
    company: "Wonka Labs",
    owner: "Jan",
    updated_at: "2024-03-27T09:51:00Z"
  },
  {
    id: "deal-7",
    name: "Enterprise support expansion",
    amount: 85000,
    pipeline_id: "pipe-sales",
    pipeline_name: "Sales Pipeline",
    stage_id: "stage-negotiation",
    stage_name: "Negotiation",
    company: "Globex Corporation",
    owner: "Ava",
    updated_at: "2024-03-31T17:20:00Z"
  },
  {
    id: "deal-8",
    name: "Ops analytics rollout",
    amount: 15000,
    pipeline_id: "pipe-sales",
    pipeline_name: "Sales Pipeline",
    stage_id: "stage-negotiation",
    stage_name: "Negotiation",
    company: "Stark Industries",
    owner: "Jan",
    updated_at: "2024-03-30T13:44:00Z"
  },
  {
    id: "deal-9",
    name: "Customer success suite",
    amount: 34000,
    pipeline_id: "pipe-sales",
    pipeline_name: "Sales Pipeline",
    stage_id: "stage-won",
    stage_name: "Won",
    company: "Pied Piper",
    owner: "Ola",
    updated_at: "2024-03-24T08:17:00Z"
  },
  {
    id: "deal-10",
    name: "Quarterly training",
    amount: 25000,
    pipeline_id: "pipe-sales",
    pipeline_name: "Sales Pipeline",
    stage_id: "stage-won",
    stage_name: "Won",
    company: "Acme Inc.",
    owner: "Ava",
    updated_at: "2024-03-26T15:02:00Z"
  }
];

export const DEMO_CONTACTS = [
  {
    id: "contact-ava",
    first_name: "Ava",
    last_name: "Nowak",
    email: "ava.nowak@example.com",
    phone: "+48 123 456 789",
    company: "Acme Inc.",
    role: "Operations lead",
    created_at: "2024-03-20T09:00:00Z",
    updated_at: "2024-03-31T11:05:00Z"
  },
  {
    id: "contact-jan",
    first_name: "Jan",
    last_name: "Kowalski",
    email: "jan.kowalski@example.com",
    phone: "+48 987 654 321",
    company: "Globex Corporation",
    role: "Account executive",
    created_at: "2024-03-18T10:15:00Z",
    updated_at: "2024-03-30T16:20:00Z"
  },
  {
    id: "contact-ola",
    first_name: "Ola",
    last_name: "Zielinska",
    email: "ola.z@example.com",
    phone: "+48 555 222 111",
    company: "Initech",
    role: "Marketing lead",
    created_at: "2024-03-15T08:45:00Z",
    updated_at: "2024-03-28T09:45:00Z"
  },
  {
    id: "contact-victor",
    first_name: "Victor",
    last_name: "Chen",
    email: "victor.chen@globex.com",
    phone: "+48 345 987 654",
    company: "Globex Corporation",
    role: "CTO",
    created_at: "2024-03-12T11:30:00Z",
    updated_at: "2024-03-29T08:12:00Z"
  },
  {
    id: "contact-sam",
    first_name: "Sam",
    last_name: "Lee",
    email: "sam.lee@acme.com",
    phone: "+48 444 333 111",
    company: "Acme Inc.",
    role: "CFO",
    created_at: "2024-03-10T07:20:00Z",
    updated_at: "2024-03-27T12:45:00Z"
  },
  {
    id: "contact-pepper",
    first_name: "Pepper",
    last_name: "Potts",
    email: "pepper@stark.com",
    phone: "+1 555 0100",
    company: "Stark Industries",
    role: "COO",
    created_at: "2024-03-08T15:10:00Z",
    updated_at: "2024-03-30T16:48:00Z"
  },
  {
    id: "contact-bruce",
    first_name: "Bruce",
    last_name: "Wayne",
    email: "bruce@wayneenterprises.com",
    phone: "+1 555 0199",
    company: "Wayne Enterprises",
    role: "CEO",
    created_at: "2024-03-05T09:50:00Z",
    updated_at: "2024-03-29T14:10:00Z"
  }
];

export const DEMO_TASKS = [
  {
    id: "task-1",
    subject: "Send renewal proposal",
    due_at: "2024-04-02T10:00:00Z",
    related_type: "deal",
    related_id: "deal-7",
    owner: "Ava",
    status: "open",
    created_at: "2024-03-28T09:12:00Z"
  },
  {
    id: "task-2",
    subject: "Prep discovery agenda",
    due_at: "2024-04-03T09:30:00Z",
    related_type: "deal",
    related_id: "deal-3",
    owner: "Jan",
    status: "open",
    created_at: "2024-03-29T14:08:00Z"
  },
  {
    id: "task-3",
    subject: "Email call recap",
    due_at: "2024-04-04T16:00:00Z",
    related_type: "deal",
    related_id: "deal-6",
    owner: "Ola",
    status: "open",
    created_at: "2024-03-30T11:27:00Z"
  },
  {
    id: "task-4",
    subject: "Schedule onboarding",
    due_at: "2024-04-05T13:00:00Z",
    related_type: "company",
    related_id: "Globex",
    owner: "Ava",
    status: "open",
    created_at: "2024-03-28T08:15:00Z"
  },
  {
    id: "task-5",
    subject: "Close lost feedback",
    due_at: "2024-04-01T12:00:00Z",
    related_type: "deal",
    related_id: "deal-10",
    owner: "Jan",
    status: "overdue",
    created_at: "2024-03-26T10:42:00Z"
  }
];

