#!/usr/bin/env node

// V24 Advisor Data Extractor
// Manually extract the key advisor info we need

const advisorsV24 = [
  {
    id: '0',
    name: 'Alex Morgan',
    role: 'Board Meeting Host & Advisor Curator', 
    expertise: ['Meeting Facilitation', 'Executive Communication', 'Strategic Synthesis', 'Decision Frameworks', 'Board Composition', 'Advisor Selection'],
    avatar_emoji: '🎯',
    is_host: true
  },
  {
    id: '1', 
    name: 'Sarah Chen',
    role: 'Chief Strategy Officer',
    expertise: ['Strategic Planning', 'Market Analysis', 'Growth Strategy'],
    avatar_emoji: '👩‍💼'
  },
  {
    id: '2',
    name: 'Marcus Johnson', 
    role: 'CFO',
    expertise: ['Financial Planning', 'Risk Management', 'Investment Strategy'],
    avatar_emoji: '👨‍💼'
  },
  {
    id: '3',
    name: 'Emily Rodriguez',
    role: 'CMO', 
    expertise: ['Brand Strategy', 'Digital Marketing', 'Customer Experience'],
    avatar_emoji: '👩‍🎨'
  },
  {
    id: '5',
    name: 'Mark Cuban',
    role: 'Entrepreneur & Investor',
    expertise: ['Venture Capital', 'Business Strategy', 'Technology Scaling', 'Sports Business', 'Media & Entertainment'],
    avatar_emoji: '🦈',
    is_celebrity: true
  },
  {
    id: '6', 
    name: 'Jason Calacanis',
    role: 'Angel Investor & Podcaster',
    expertise: ['Angel Investing', 'Startup Acceleration', 'Media & Publishing', 'Early-Stage Ventures', 'Founder Education'],
    avatar_emoji: '🎙️',
    is_celebrity: true
  },
  {
    id: '7',
    name: 'Sheryl Sandberg',
    role: 'Operations & Leadership Expert', 
    expertise: ['Operations Scaling', 'Advertising Business', 'Regulatory Navigation', 'Leadership Development', 'Organizational Culture'],
    avatar_emoji: '👩‍💼',
    is_celebrity: true
  },
  {
    id: '8',
    name: 'Ruth Porat',
    role: 'CFO & Finance Expert',
    expertise: ['Corporate Finance', 'Investment Banking', 'Strategic Planning', 'Capital Markets', 'Risk Management'],
    avatar_emoji: '👩‍💼',
    is_celebrity: true
  },
  {
    id: '9',
    name: 'Tim Cook',
    role: 'CEO & Operations Expert',
    expertise: ['Supply Chain Management', 'Global Operations', 'Strategic Leadership', 'Technology Innovation', 'Crisis Management'],
    avatar_emoji: '👨‍💼',
    is_celebrity: true
  },
  {
    id: '10',
    name: 'Safra Catz',
    role: 'CEO & Technology Executive', 
    expertise: ['Enterprise Software', 'Cloud Computing', 'Corporate Strategy', 'M&A', 'Global Business'],
    avatar_emoji: '👩‍💼',
    is_celebrity: true
  },
  {
    id: '11',
    name: 'Marc Benioff',
    role: 'CEO & Cloud Computing Pioneer',
    expertise: ['SaaS Strategy', 'Customer Success', 'Platform Business', 'Corporate Culture', 'Social Impact'],
    avatar_emoji: '☁️',
    is_celebrity: true
  },
  {
    id: '12',
    name: 'Satya Nadella',
    role: 'CEO & Digital Transformation Leader',
    expertise: ['AI Strategy', 'Cloud Computing', 'Digital Transformation', 'Cultural Change', 'Partnership Strategy'], 
    avatar_emoji: '🤖',
    is_celebrity: true
  },
  {
    id: '13',
    name: 'Susan Wojcicki',
    role: 'Former YouTube CEO & Product Expert',
    expertise: ['Product Strategy', 'Content Platforms', 'Creator Economy', 'Advertising Technology', 'Platform Governance'],
    avatar_emoji: '📺',
    is_celebrity: true
  },
  {
    id: '14', 
    name: 'Andy Jassy',
    role: 'CEO & Cloud Infrastructure Expert',
    expertise: ['Cloud Infrastructure', 'Enterprise Services', 'Platform Strategy', 'Business Development', 'Global Scaling'],
    avatar_emoji: '☁️',
    is_celebrity: true
  },
  {
    id: '15',
    name: 'Reid Hoffman',
    role: 'Founder & Network Strategy Expert',
    expertise: ['Network Effects', 'Platform Strategy', 'Venture Capital', 'Entrepreneurship', 'Professional Networks'],
    avatar_emoji: '🤝', 
    is_celebrity: true
  }
];

// Generate SQL
console.log('🔄 Generating V30 Advisor Migration SQL');
console.log('=======================================\n');

let sqlStatements = [];

// Clear existing default advisors
sqlStatements.push('-- V24 to V30 Advisor Migration');
sqlStatements.push('-- Clear existing default advisors and add enhanced V24 set');
sqlStatements.push('');
sqlStatements.push('DELETE FROM advisors WHERE is_custom = false;');
sqlStatements.push('');

// Generate UUIDs and SQL for each advisor
advisorsV24.forEach((advisor, index) => {
  const uuid = `00000000-0000-0000-0000-${String(index + 1).padStart(12, '0')}`;
  
  // Create basic system prompt
  const systemPrompt = `You are ${advisor.name}, ${advisor.role}. You bring expertise in ${advisor.expertise.slice(0,3).join(', ')}.`;

  // Basic personality based on role
  let personality = {
    traits: ['professional', 'knowledgeable', 'strategic'],
    communication_style: 'professional'
  };

  // Celebrity advisors get enhanced personalities
  if (advisor.is_celebrity) {
    switch(advisor.name) {
      case 'Mark Cuban':
        personality = {
          traits: ['direct', 'competitive', 'pragmatic', 'passionate', 'no-nonsense'],
          communication_style: 'straight-shooter'
        };
        break;
      case 'Jason Calacanis':
        personality = {
          traits: ['educational', 'supportive', 'enthusiastic', 'mentor-focused'],
          communication_style: 'educational-mentor'
        };
        break;
      case 'Sheryl Sandberg':
        personality = {
          traits: ['empowering', 'strategic', 'inclusive', 'transformational'],
          communication_style: 'empowering-leader'
        };
        break;
    }
  }

  const sql = `INSERT INTO advisors (
  id, 
  name, 
  role, 
  expertise, 
  personality, 
  avatar_emoji, 
  system_prompt, 
  is_custom, 
  is_active
) VALUES (
  '${uuid}',
  '${advisor.name.replace(/'/g, "''")}',
  '${advisor.role.replace(/'/g, "''")}',
  ARRAY[${advisor.expertise.map(e => `'${e.replace(/'/g, "''")}'`).join(', ')}],
  '${JSON.stringify(personality)}'::jsonb,
  '${advisor.avatar_emoji}',
  '${systemPrompt.replace(/'/g, "''")}',
  false,
  true
);`;

  sqlStatements.push(`-- ${advisor.name}`);
  sqlStatements.push(sql);
  sqlStatements.push('');
});

const fs = require('fs');
const path = require('path');

// Write SQL file
const sqlContent = sqlStatements.join('\n');
fs.writeFileSync('v24-to-v30-migration.sql', sqlContent);

console.log('✅ Migration SQL created: v24-to-v30-migration.sql');
console.log(`📊 ${advisorsV24.length} advisors ready to migrate`);

// Show summary
console.log('\n📋 Advisor List:');
console.log('================');
advisorsV24.forEach((advisor, index) => {
  const celebrity = advisor.is_celebrity ? ' ⭐' : '';
  const host = advisor.is_host ? ' 🎯' : '';
  console.log(`${index + 1}. ${advisor.name} - ${advisor.role}${celebrity}${host}`);
});

console.log('\n🚀 Next Steps:');
console.log('1. Review v24-to-v30-migration.sql');
console.log('2. Run SQL in your V30 Supabase SQL Editor');
console.log('3. Test the advisors in your V30 app');