-- Enable the uuid-ossp extension to use UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create the peer table
CREATE TABLE peer (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ip VARCHAR(255) NOT NULL,
    port INT NOT NULL,
    isOnline BOOLEAN DEFAULT false, 
    uploaded INT DEFAULT 0,
    download INT DEFAULT 0,
    createTime TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP  -- Column for record creation time
);

-- Create the file table
CREATE TABLE file (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    fname VARCHAR(255) NOT NULL,
    fsize BIGINT NOT NULL,
    magnetLink VARCHAR(255),
    createTime TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP  -- Column for record creation time
);

-- Create the peerFileR table
CREATE TABLE peerFileR (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    peerId UUID NOT NULL,
    fileId UUID NOT NULL,
    
    FOREIGN KEY (peerId) REFERENCES peer(id) ON DELETE CASCADE,
    FOREIGN KEY (fileId) REFERENCES file(id) ON DELETE CASCADE,
    createTime TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP  -- Column for record creation time
);

-- Create the piece table
CREATE TABLE piece (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    fileId UUID NOT NULL,
    psize BIGINT NOT NULL,
    pindex INT NOT NULL,
    
    FOREIGN KEY (fileId) REFERENCES file(id) ON DELETE CASCADE,
    createTime TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP  -- Column for record creation time
);
